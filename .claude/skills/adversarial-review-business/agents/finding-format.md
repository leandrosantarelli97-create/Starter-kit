# Formato finding

Ogni sotto-review restituisce una lista di findings in JSON, tutti con lo stesso schema.
Lo schema è unico per le tre aree (business, bug, security) perché il consolidamento avviene
a posteriori.

## Schema JSON

```json
[
  {
    "category": "business" | "bug" | "security",
    "severity": "critical" | "high" | "medium" | "low",
    "title": "Titolo breve, imperativo, <= 80 caratteri",
    "file": "path/relativo/dalla/root/del/repo.ext",
    "line_start": 123,
    "line_end": 145,
    "spec_rule": "Citazione testuale della regola violata (solo per category=business; altrimenti null)",
    "description": "Cosa c'è nel codice, perché è sbagliato. Prosa, 2-5 frasi.",
    "evidence": "Snippet di codice rilevante, poche righe. Usa \\n per newline.",
    "impact": "Scenario concreto di cosa succede in produzione se non si corregge.",
    "suggestion": "Direzione del fix in 1-2 frasi. Non il codice completo."
  }
]
```

## Severity

Usa questa scala. **In caso di dubbio, scendi di un livello, non salire**: una review che
gonfia le severity perde credibilità e fa perdere tempo a chi la legge. Un finding sovradimensionato
costringe il fixer a indagare un "Critical" che si rivela un "Medium" — è rumore peggiore
del finding mancato, perché distrugge la fiducia nel resto del report.

### Cancello concreto per Critical (test obbligatorio)

Un finding è **critical solo se passa TUTTI e tre questi test**. Se anche uno solo non passa,
la severity scende a high o sotto.

1. **Exploit/rottura concreta, non ipotetica.** Devi poter descrivere lo scenario in 1-2 frasi
   senza usare le parole "se", "in caso di", "potenzialmente", "race condition non gestita",
   "combinato con". Se servono congiunzioni di altri findings o assunzioni su comportamenti
   non osservati nel codice, **non è critical**.
2. **Trigger raggiungibile da input/azioni che il sistema accetta oggi**, non da scenari che
   richiedono un altro bug aperto, un comportamento futuro non implementato, o uno stack di
   coincidenze. Se serve un "ma se per qualche motivo la cache si invalida male e il client
   rimanda…", non è critical.
3. **Vittima diversa dall'attore stesso, o danno sistemico.** Un utente autenticato che può
   sabotare *solo i propri dati* tramite la propria interfaccia (self-DoS, self-data-loss,
   "l'artista può cancellarsi le proprie tracce") **non è critical**: è un fastidio per
   quell'utente, non una falla della piattaforma. Diventa critical solo se il danno tocca
   altri utenti, dati di sistema, o è irreversibile su scala (data breach, RCE, escalation
   cross-tenant, perdita di integrità per terzi).

### Scala

- **critical** — Passa il cancello sopra. Esempi che qualificano:
  - Endpoint pubblico che ritorna 500 sul flusso felice o blocca completamente la feature
    principale della spec
  - Auth bypass / IDOR cross-tenant raggiungibile con un account qualsiasi
  - SQL injection, RCE, path traversal con scrittura
  - Dato sensibile di altri utenti esposto in response
  - Regola di business centrale della spec **completamente assente** (non "implementata male
    in un edge case")

  Esempi che **NON** qualificano (anche se "gravi" a prima vista):
  - "L'artista può chiamare l'endpoint X con un suo s3Key e cancellarsi un proprio file" →
    **self-DoS deliberato**, di default **medium** (vedi sotto)
  - "Se due richieste concorrenti arrivano nell'ordine sbagliato, il file potrebbe essere
    cancellato" senza prova che il client le emette davvero in quell'ordine → **high** o
    **medium** secondo plausibilità del trigger
  - "Manca il rate limit per-utente, un attaccante potrebbe consumare bandwidth" senza un
    costo concreto in produzione (S3 transfer in è praticamente gratis, lifecycle policy
    pulisce gli orfani) → **high** o **medium**
  - "Persistente da iter-N" — la persistenza non eleva la severity, valuta sempre con i criteri
    sopra come se fosse la prima volta che lo vedi
  - Bug che richiede una catena di altri bug aperti per manifestarsi → **high** al massimo

### Calibrazione del self-DoS / self-harm (importante)

Il self-DoS è un caso ricorrente in cui i reviewer tendono a gonfiare la severity. Calibralo
così — la regola di default è **medium**, alza a high solo con prove concrete:

- **Default: medium.** Un utente autenticato che può sabotare *solo i propri dati* attraverso
  la propria interfaccia / il proprio token, e per farlo deve compiere passi non triviali
  (aprire devtools, leggere id da response API, costruire manualmente una richiesta) **è
  medium**. Motivazione: la piattaforma non deve proteggere l'utente da se stesso quando usa
  strumenti da sviluppatore sui propri dati con la propria autenticazione, equivale a
  `localStorage.clear()` in console — non è un bug della piattaforma. Vale la pena chiuderlo
  per hardening (audit, robustezza, evoluzione futura), non come blocker.
- **Sale a high solo se almeno una di queste è vera:**
  - **Superficie larga**: il sabotaggio è raggiungibile da un'azione dell'UI comune o da una
    sequenza che un utente fa per errore in un flusso normale (non solo da devtools)
  - **Trigger osservabile nel codice**: esiste un percorso reale (race su unmount durante
    mutation, retry mal gestito, evento concorrente) che può sparare la cancellazione **senza
    intenzione esplicita dell'utente**, e il percorso è descrivibile leggendo il codice (non
    speculativo)
  - **Reti di sicurezza assenti**: non c'è alcuna verifica server-side né cleanup compensativo
    che limiti il danno
  - **Danno irreversibile e visibile**: non solo "rumore", ma perdita di contenuto pubblicato
    di cui l'utente ha bisogno per il proprio business
- **Sale a critical**: mai, fintanto che la vittima è solo l'attore stesso. Critical richiede
  vittima ≠ attore o danno sistemico — è il terzo test del cancello sopra.

- **high** — Il codice funziona ma si rompe su input plausibili, o viola una regola di business
  secondaria, o ha un buco di sicurezza con prerequisiti ragionevoli. Tipici candidati:
  validazione mancante su parametro obbligatorio, race condition con trigger realistico,
  self-DoS con superficie ampia, mancanza di rate limit su azione costosa, errore in inglese
  mostrato all'utente per un flusso comune, scrittura spuria su DB su modifica vuota.

- **medium** — Edge case non gestito, deviazione dalla spec in scenario raro, hardening
  security desiderabile su asset di basso valore. Tipici: null check mancante su percorso non
  frequente, toast generico in scenari secondari, side effect senza rollback su errore
  improbabile, audit log mancante.

- **low** — Fragilità, dubbi minori, code smell con impatto pratico nullo. Non usare per
  stile/formattazione del codice sorgente.

### Anti-pattern di calibrazione (da evitare attivamente)

- **Inflazione da combinazione**: "F-X è high, F-Y è high, ma combinati sono critical". No.
  Il finding combinato non esiste come singola entità da fixare; ognuno va valutato sul proprio
  trigger. Se vuoi evidenziare la combinazione, aggiungi un cross-reference nella description,
  non alzare la severity.
- **Inflazione da "potrebbe"**: "in produzione potrebbe succedere X". Se non c'è un percorso
  concreto, scendi a medium o low.
- **Inflazione da self-harm**: l'utente che attacca se stesso non è critical. La piattaforma
  non deve proteggere l'utente dalle proprie azioni esplicite sui propri dati, salvo regole di
  business specifiche (es. compliance, audit, immutabilità).
- **Inflazione da debt pre-esistente**: un problema che vive nel codice già da prima e non è
  toccato dal diff non è un finding di questa review (men che meno critical). Eventualmente
  notalo a margine.

## Cosa NON deve andare nel finding

- Problemi di stile, naming, formatting, commenti (a meno che non causino bug)
- Suggerimenti di refactoring non legati a correttezza
- Commenti filosofici ("questa parte potrebbe essere più elegante")
- Lodi o conferme ("questo è implementato bene") — i riconoscimenti positivi vanno nel
  coverage, non nei findings

## Esempio di finding valido

```json
{
  "category": "business",
  "severity": "high",
  "title": "Il controllo di ownership sull'operazione di modifica è assente",
  "file": "backend/src/modules/document/document.controller.ts",
  "line_start": 42,
  "line_end": 58,
  "spec_rule": "Solo il proprietario del documento può modificarlo. Gli altri utenti ricevono errore di permesso negato.",
  "description": "L'endpoint di modifica legge il documento e applica il patch senza verificare che l'utente autenticato sia il proprietario. Qualsiasi utente autenticato può modificare qualsiasi documento se conosce l'ID.",
  "evidence": "const doc = await getDocument(id);\ndoc.title = req.body.title;\nawait saveDocument(doc);",
  "impact": "Utente A autenticato può modificare il documento di utente B semplicemente passando l'ID. Violazione diretta della regola di ownership e potenziale data integrity breach.",
  "suggestion": "Aggiungere verifica che doc.owner_id === req.user.id prima di applicare la modifica; restituire 403 in caso contrario."
}
```

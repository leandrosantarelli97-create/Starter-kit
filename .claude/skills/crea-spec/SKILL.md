---
name: crea-spec
description: |
  Genera spec strutturate di sola business logic a partire da un functional requirement grezzo.
  Usa questa skill ogni volta che l'utente fornisce un requisito funzionale (anche di una riga)
  e vuole trasformarlo in una spec completa prima di implementarla. Attiva quando l'utente dice
  "crea una spec", "specifica questa feature", "definisci i requisiti per", "spec per",
  "voglio specificare", "prepara la spec di", o fornisce un requisito funzionale e chiede
  di dettagliarlo. Attiva anche quando l'utente menziona un punto del PRD e chiede di espanderlo
  in una spec, o quando dice "prima di implementare, definiamo la business logic".
  NON usare per: implementazione codice, pianificazione tecnica, code review, debugging.
---

# crea-spec

Trasforma un functional requirement grezzo in una spec di business logic completa, strutturata
e pronta da passare all'implementazione.

La spec descrive COSA deve succedere — regole, permessi, flussi, edge case. Non descrive COME
implementarlo — niente endpoint, migration, file, middleware, test. La parte tecnica si decide
dopo, leggendo la spec.

La spec prodotta farà da input a due future fasi di adversarial review: una sulla corrispondenza
tra codice e business logic, una sulla corrispondenza tra codice e design. Entrambe leggeranno
spec + codice, senza toccare il browser. Tieni questa destinazione d'uso in mente: ogni sezione
deve essere utile a chi legge il codice confrontandolo con la spec.

---

## Principio: lean-first per progetti greenfield

I progetti per cui questa skill produce spec sono greenfield: nessun utente esistente da
proteggere, nessun debito tecnico da rispettare, ottimizzati per arrivare a un MVP funzionante
con la minima architettura possibile. Quando esistono più modi di soddisfare lo stesso requisito
funzionale, la spec deve **sempre proporre per primo il flusso più lean** — quello che produce
codice più semplice, meno entità, meno stati, meno integrazioni esterne, meno superficie di bug.

L'utente può sempre scegliere il flusso complesso, ma il default consigliato è la versione lean.

**Esempio concreto.** Requisito: "l'utente può aggiornare la propria email".

| Flusso complesso (NON consigliare per primo)                                            | Flusso lean (CONSIGLIARE per primo)                                                                    |
|-----------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| Form con un campo email → richiesta in stato `pending` → invio link di conferma all'email nuova → cambio effettivo solo dopo click | Form con due campi: "email nuova" + "conferma email", il secondo con paste disabilitato → cambio immediato al submit |
| Richiede: tabella richieste pending, generazione token, invio email transazionale, endpoint di conferma, scadenza token, logica di rollback se non confermato | Richiede: validazione che i due campi coincidano, update diretto del campo email                       |

Entrambi soddisfano lo stesso requisito di business: ridurre il rischio che l'utente inserisca
un'email errata. La versione lean ottiene il risultato senza alcuna macchina a stati né
infrastruttura email.

**Come applicare questo principio nelle domande:**
- Quando proponi opzioni in `AskUserQuestion`, la prima opzione (etichetta "(Consigliato)")
  deve essere sempre la più lean a parità di obiettivo di business.
- Se ti viene in mente un flusso complesso "perché si fa sempre così" (verifiche via email,
  workflow di approvazione multi-step, code asincrone, soft delete con grace period), prima
  chiediti: esiste una versione più semplice che ottiene lo stesso risultato di business?
  Se sì, quella è il default consigliato.
- **Presenta SEMPRE entrambe le opzioni — lean e conservativa — nella stessa domanda.**
  Lean-first significa che la lean è il default suggerito, NON che l'opzione conservativa
  vada nascosta o omessa. L'utente deve sempre poter scegliere fra entrambe in modo
  informato. Se identifichi un'area dove esiste un'alternativa conservativa significativa
  (compliance, sicurezza, audit, ripristino, retention dati, multi-tenancy, ecc.), quella
  alternativa va inclusa come opzione esplicita, descritta lealmente — senza trattarla come
  "sbagliata" o "sopra-ingegnerizzata", ma come scelta legittima con i suoi trade-off.
  Ignorare l'opzione conservativa è un errore: riduce la spec a un'eco delle preferenze
  della skill invece di un dialogo che consenta all'utente di valutare.
- Patterns lean da preferire quando applicabili (e relative alternative conservative da
  presentare comunque come opzione):
  - Validazione client-side tramite doppio input ↔ verifica via email/SMS con token
  - Cambio di stato sincrono ↔ workflow `pending` + conferma asincrona
  - Hard delete ↔ soft delete + grace period + cron di pulizia (utile per recupero o GDPR)
  - Singola tabella con flag ↔ tabella separata con relazione
  - Conferma in modale ↔ email di conferma
  - Limite hardcoded ↔ sistema di configurazione utente
  - Nessuna re-autenticazione ↔ richiesta password attuale (anti session-hijacking)
  - Nessun audit log ↔ audit log persistente (per compliance/troubleshooting)
  - Nessuna notifica all'utente cancellato ↔ email di conferma all'indirizzo (sicurezza)
- Aree dove l'alternativa conservativa va SEMPRE proposta come opzione esplicita, anche
  se l'utente non l'ha menzionata, perché non sollevarla rischia di omettere requisiti
  che potrebbero essere obbligatori nel contesto reale dell'utente:
  - Cancellazione/modifica di dati personali (GDPR Art. 17 / Art. 16, conservazione
    obbligata di fatture e audit log)
  - Pagamenti, fatturazione, dati finanziari (PCI-DSS, conservazione fiscale)
  - Operazioni distruttive irreversibili (autenticazione step-up, audit log, undo,
    grace period)
  - Autenticazione e gestione sessioni (re-auth, invalidazione sessioni, MFA)
  - Dati sanitari, dati di minori, dati biometrici (vincoli legali specifici)
  - Operazioni che inviano comunicazioni esterne (email, SMS, notifiche a soggetti
    diversi dall'iniziatore)

Se l'utente esprime un vincolo specifico (es. "voglio assolutamente la doppia verifica via
email per ragioni di compliance"), allora quel vincolo prevale e proponi il flusso
conservativo come "(Consigliato)" invertendo il default. Ma anche in assenza di un
vincolo esplicito, la presenza dell'opzione conservativa nella lista di scelte è
**obbligatoria**: non assumere lean unilateralmente.

**Lean ≠ incompleta.** Lean si applica alla scelta del *flusso* (architettura, numero di stati,
integrazioni richieste), NON alla copertura dei casi nella spec. Una volta che l'utente ha
scelto il flusso lean, la spec deve comunque coprire tutti i casi: ruoli, permessi, regole di
business, precondizioni, side effect, risposte attese per successo / errore di validazione /
permesso negato / risorsa non trovata / conflitti / stati incompatibili, edge case emersi
dalle domande. L'esaustività della spec non è in conflitto con la leanness del flusso — sono
due dimensioni diverse e indipendenti. Continua a fare batch di domande fino a coprire ogni
area, esattamente come prima.

---

## Step 1 — Raccolta contesto

Prima di fare domande, capisci cosa esiste già nel progetto. Questo ti permette di fare domande
informate e non chiedere cose che puoi determinare dal codice.

### Esplora autonomamente

Lancia subagenti in parallelo (o leggi direttamente se il progetto è piccolo) per scoprire cosa
c'è. Adatta il set di file esplorati al tipo di progetto che stai guardando.

| File / directory                              | Cosa cerchi                                     |
| --------------------------------------------- | ----------------------------------------------- |
| `CLAUDE.md` (root) e CLAUDE.md nidificati     | Stack, struttura, convenzioni del progetto      |
| `README.md` / `README` in root                | Overview, come si avvia, dipendenze             |
| `package.json` / `pyproject.toml` / `Gemfile` | Linguaggio, framework, comandi di sviluppo      |
| `docs/` (se esiste)                           | Documentazione architetturale e API             |
| Schema DB (`schema.sql`, `prisma/schema.prisma`, `db/migrations/`, `docs/db-schema/`) | Entità e relazioni esistenti |
| `specs/` (se esiste)                          | Spec precedenti che stabiliscono convenzioni    |

Mentre esplori, se il requirement menziona entità, comportamenti o flussi che sembrano toccare
aree specifiche (pagamenti, notifiche, autenticazione, moderazione, matching, ecc.), segui i
link: se `CLAUDE.md` rimanda a `docs/db-schema/db-payments.md` e il requirement parla di saldo,
vai a leggerlo.

Se il progetto usa un database accessibile via MCP (Supabase, Postgres, ecc.) e ti serve
verificare lo stato reale di una tabella o colonna per formulare meglio una domanda, usalo.
Non è obbligatorio: usalo solo se utile al task corrente.

### Cerca funzionalità impattate lateralmente

Una nuova feature raramente vive in isolamento: spesso richiede modifiche a feature già esistenti
perché queste preparino lo stato necessario, o perché cambino comportamento in presenza della
nuova feature. Esempio reale: una feature di "invito collaboratori in azienda" richiede che la
registrazione dell'azienda flagghi il primo utente come "può invitare". Senza questo impatto
laterale, la nuova feature è incompleta.

Questi impatti laterali sono la causa principale di spec che sembrano complete ma producono
codice rotto. Cercali sempre, prima di passare alle domande di business.

Lancia una ricerca mirata (subagenti in parallelo se il progetto è grande, lettura diretta se
piccolo) per identificare feature esistenti potenzialmente impattate. Categorie tipiche da
considerare:

- **Onboarding e registrazione**: la nuova feature richiede campi, flag o stato sull'utente/entità
  al momento della creazione? (es. ruolo iniziale, permessi default, opt-in)
- **Entità correlate**: la nuova feature legge/modifica entità che hanno già flussi di vita
  propri (creazione, archiviazione, soft delete)? Quei flussi devono cambiare?
- **Permessi e ruoli esistenti**: ruoli già definiti devono ricevere/perdere capacità?
- **Notifiche e comunicazioni**: esistono già flussi di email/notifiche che vanno estesi
  (es. template, preferenze utente, code di invio)?
- **Stati e macchine a stati**: la nuova feature aggiunge/modifica stati su entità esistenti?
- **Statistiche, contatori, dashboard**: esistono aggregazioni che dovranno includere questa
  nuova feature?
- **Settings e configurazione**: la nuova feature richiede nuove preferenze utente/azienda
  che vanno aggiunte alle pagine di settings esistenti?
- **Cleanup e cascade**: cosa succede a dati di questa nuova feature quando un'entità correlata
  viene cancellata/archiviata?

Per ogni candidato impatto laterale che identifichi, prepara una domanda specifica per il
batch "Impatti collaterali" dello Step 2. Non assumere mai che un impatto vada gestito o
ignorato — chiedi sempre all'utente.

### Chiedi solo se manca qualcosa

Se dopo aver esplorato ti resta un buco di contesto che non puoi colmare dal codice (es. non
trovi documentazione sui ruoli utente, o il progetto è troppo nuovo), fai domande mirate
all'utente prima di proseguire.

Riassumi internamente cosa hai trovato. Non mostrare il dump completo all'utente — usa il
contesto per formulare domande migliori.

---

## Step 2 — Domande di business

Fai all'utente tutte le domande necessarie per definire completamente la feature. La regola
fondamentale: se non puoi determinare una risposta dal contesto del progetto, chiedi. Non
assumere, non indovinare, non decidere al posto dell'utente.

### Come fare le domande: usa SEMPRE AskUserQuestion

Usa il tool `AskUserQuestion` per ogni batch di domande. Mai scrivere domande come testo libero
nella conversazione — il tool offre opzioni selezionabili che rendono il processo più rapido e
meno ambiguo per l'utente.

**Vincoli del tool:**
- Da 1 a 4 domande per chiamata
- Da 2 a 4 opzioni per domanda (l'utente può sempre scegliere "Other" per rispondere liberamente)
- `multiSelect: true` quando le opzioni non si escludono a vicenda
- Metti SEMPRE per prima l'opzione **più lean** (vedi sezione "Principio: lean-first per
  progetti greenfield"), con "(Consigliato)" nel label. La leanness vince sulla probabilità a
  priori: se due opzioni sembrano ugualmente probabili, la più semplice da implementare è
  quella consigliata. Se l'opzione lean rimuove un intero pezzo di architettura (workflow
  asincrono, tabella di stato, integrazione email), aggiungi una breve giustificazione nel
  campo `description` ("evita la macchina a stati pending+conferma").

**Come strutturare le domande:**
- `header`: etichetta breve (max 12 caratteri), es. "Permessi", "Pagamenti", "Notifiche"
- `question`: domanda completa e specifica, che finisce con "?"
- `options`: scelte concrete con `label` breve (1-5 parole) e `description` che spiega le implicazioni
- Usa `preview` per mostrare mockup di flussi o confronti quando serve

**Strategia a batch:**
Raggruppa le domande per area tematica. Fai un batch alla volta (max 4 domande), poi usa le
risposte per formulare il batch successivo. Le risposte di un batch possono far emergere
nuove domande — è normale e desiderato.

Ordine tipico dei batch:
1. **Ruoli e permessi** — chi può fare cosa
2. **Regole di business** — condizioni, limiti, vincoli
3. **Precondizioni e flusso** — dipendenze, stati, sequenze
4. **Side effect** — notifiche, contatori, log, effetti su altre entità
5. **Impatti collaterali** — modifiche richieste a feature esistenti (vedi sotto)
6. **Riferimenti di design** — link o screenshot per ogni stato della UI
7. **Componenti riutilizzabili** — componenti di design già presenti nell'app
8. **Follow-up** — chiarimenti su risposte ambigue

### Aree da coprire

Passa in rassegna ciascuna di queste aree. Se il contesto del progetto risponde già ad alcune
domande, non chiederle — confermale e vai avanti.

**Ruoli e permessi**
- Chi può eseguire questa operazione? Elenca i ruoli del sistema e chiedi per ciascuno.
- Chi può vedere cosa? Ownership: un utente può agire solo sulle proprie risorse?
- Ci sono casi in cui un ruolo ha accesso parziale? (es. vede ma non modifica)

**Regole di business**
- Quali condizioni devono essere vere perché l'operazione riesca?
- Cosa succede se una condizione non è soddisfatta? Per ogni condizione, chiedi il comportamento.
- Ci sono stati o status che determinano il comportamento? (es. "solo se lo status è X")
- Ci sono limiti quantitativi? (es. massimo N elementi, minimo Y di credito)
- Ci sono vincoli temporali? (es. entro 24h, non prima di, non dopo)

**Precondizioni di flusso**
- Questa operazione dipende dal completamento di un'altra?
- Cosa succede se viene chiamata fuori sequenza?
- L'ordine conta? C'è una macchina a stati?

**Side effect**
- L'operazione modifica altre entità oltre alla principale?
- Invia notifiche? A chi? Quando? Con quale contenuto?
- Consuma o genera valore (crediti, punti, quota, abbonamenti)?
- Aggiorna statistiche, contatori, log?
- Se un side effect fallisce, l'operazione principale deve rollbackare o procedere?

**Risposte attese**
- Qual è il comportamento per: successo, errore di validazione, permesso negato, risorsa non
  trovata, conflitto (es. doppia prenotazione), risorsa in stato incompatibile?

**Impatti collaterali (chiedi SEMPRE)**
Per ogni candidato impatto laterale identificato durante lo Step 1 (sezione "Cerca funzionalità
impattate lateralmente"), fai una domanda dedicata all'utente con AskUserQuestion. La risposta
determina se quell'impatto va incluso nella spec come modifica richiesta a una feature
esistente, ignorato, o discusso più a fondo.

Anche se durante l'esplorazione non hai identificato candidati ovvi, fai comunque almeno una
domanda di chiusura del tipo "C'è qualche flusso esistente che secondo te questa feature
modifica e che non abbiamo coperto?" — l'utente conosce il prodotto meglio di quanto tu possa
desumere dal codice.

Esempio di domanda per un impatto laterale (caso reale: feature "invito collaboratori" che
impatta la registrazione azienda):

```
{
  question: "Durante la registrazione di una nuova azienda, il primo utente deve essere flaggato come 'può invitare collaboratori'. Vogliamo includere questa modifica al flusso di registrazione esistente nella spec?",
  header: "Impatto registr.",
  multiSelect: false,
  options: [
    { label: "Sì, includi nella spec (Consigliato)", description: "La spec descriverà anche la modifica al flusso di registrazione: il primo utente azienda riceve il permesso di invitare" },
    { label: "Discutiamone", description: "Prima di decidere voglio capire meglio le implicazioni" },
    { label: "No, lo gestisco a parte", description: "Non includere in questa spec, sarà oggetto di una spec separata" }
  ]
}
```

Per ogni risposta "Sì, includi nella spec" o "Discutiamone risolto in inclusione", l'impatto
va documentato nella sezione "Impatti su altre funzionalità" della spec finale (vedi Step 3),
specificando: feature impattata, modifica richiesta, motivo (perché serve a questa feature).

**Riferimenti di design (per feature con UI)**
Se la feature ha una parte frontend, chiedi all'utente i riferimenti visivi. Serviranno alla
futura skill di adversarial design review, che confronterà il codice frontend prodotto con
questi riferimenti.

Chiedi prima se esistono riferimenti, poi — se sì — fatti dare un riferimento per ogni stato
significativo emerso dalle regole di business. Gli stati tipici sono: default popolato, vuoto,
errore, loading, successo, eventuali varianti (ruoli diversi, filtri applicati). Se la feature
è semplice può bastare un riferimento solo; se è complessa incoraggia l'utente a fornirne
uno per stato.

Usa AskUserQuestion con una domanda come:
```
{
  question: "Hai riferimenti di design per questa feature? (Figma, screenshot, mockup HTML)",
  header: "Design",
  multiSelect: false,
  options: [
    { label: "Sì, invio link Figma", description: "Ho i link ai frame Figma per ogni stato della UI" },
    { label: "Sì, invio screenshot", description: "Non ho Figma ma posso fornire screenshot o mockup HTML" },
    { label: "No, solo funzionale", description: "Non ci sono mockup. La skill di design review non sarà applicabile a questa feature" }
  ]
}
```

Se l'utente risponde "Sì", fai follow-up elencando gli stati attesi e chiedi un riferimento per
ciascuno. Se la feature è semplice e un solo riferimento basta, accettalo e procedi.

Se l'utente risponde "No, solo funzionale", includi comunque la sezione `## Riferimenti di design`
nella spec finale con la nota di assenza (vedi template Step 3). Non ometterla: la sua presenza
esplicita dice alla skill di design review che la review non è applicabile. Omettere equivale a
dire "feature senza UI", che è un'informazione diversa.

**Componenti di design riutilizzabili (chiedi SEMPRE se la feature ha UI)**
Per ogni feature con UI, chiedi all'utente se nell'app esistono già componenti di design
(pagine, sezioni, pattern di layout, card, form, filtri, ecc.) che possono essere riutilizzati
o presi come riferimento. Questo evita di reinventare componenti già esistenti e mantiene
coerenza visiva. Serve anche alla futura skill di design review per verificare che il codice
non crei varianti inutili di componenti che già esistono.

Usa AskUserQuestion con una domanda come:
```
{
  question: "Ci sono componenti o pagine già esistenti nell'app che possiamo riutilizzare o prendere come riferimento per questa feature? (es. layout simili, card, form, sidebar, pattern di navigazione)",
  header: "Riuso UI",
  multiSelect: false,
  options: [
    { label: "Sì, indico quali (Consigliato)", description: "Ci sono componenti/pagine esistenti da riutilizzare o usare come base" },
    { label: "No, tutto nuovo", description: "Non ci sono componenti esistenti rilevanti, va progettato da zero" },
    { label: "Non so, esplora tu", description: "Non sono sicuro, verifica nel codebase se ci sono pattern riutilizzabili" }
  ]
}
```

Se l'utente indica componenti esistenti, annotali nella sezione "Componenti di design
riutilizzabili" della spec.

### Esempio di chiamata AskUserQuestion

Per una feature di condivisione di un documento con un altro utente, il primo batch potrebbe
essere:

```
AskUserQuestion({
  questions: [
    {
      question: "Chi può condividere un documento?",
      header: "Permessi",
      multiSelect: false,
      options: [
        { label: "Solo il proprietario (Consigliato)", description: "Solo l'utente che ha creato il documento" },
        { label: "Proprietario + editor", description: "Chi ha permessi di modifica sul documento" },
        { label: "Chiunque con accesso", description: "Chiunque può vedere il documento può anche condividerlo" }
      ]
    },
    {
      question: "La condivisione richiede un piano a pagamento?",
      header: "Gating",
      multiSelect: false,
      options: [
        { label: "No, sempre disponibile (Consigliato)", description: "La condivisione è disponibile in tutti i piani" },
        { label: "Sì, solo piani a pagamento", description: "Il piano free non può condividere; vede un upsell" },
        { label: "Sì, con limite numerico", description: "Il piano free può condividere fino a N volte" }
      ]
    },
    {
      question: "Se il documento è già condiviso con quella persona?",
      header: "Conflitti",
      multiSelect: false,
      options: [
        { label: "Aggiorna i permessi (Consigliato)", description: "Il nuovo livello di permesso sostituisce quello precedente" },
        { label: "Rifiuta", description: "Mostra errore 'già condiviso con questo utente'" }
      ]
    }
  ]
})
```

Procedi con batch successivi finché non hai chiarezza su ogni aspetto. Non passare alla
generazione della spec con dubbi aperti.

---

## Step 2.5 — Controllo conflitti con spec esistenti

Prima di generare la spec, verifica se quella che stai per scrivere entra in conflitto con
spec già presenti in `specs/`. Le spec esistenti sono il contratto vigente del prodotto: una
nuova spec che le contraddice senza dichiararlo produce codice incoerente, review che falliscono
in modo confuso, e debito di allineamento che cresce nel tempo. Quando due spec governano lo
stesso flusso con regole opposte e non riconciliate, qualunque review successiva non sa quale
delle due sia "giusta" e l'implementazione finisce per implementarne una a caso.

### Cosa fare

1. **Leggi tutte le spec in `specs/`** (se la directory esiste e contiene file). Per progetti
   con molte spec, lancia un subagente generico (`subagent_type: general-purpose`,
   `model: sonnet`) con istruzione mirata: "leggi ogni file .md in `specs/` e per ciascuno
   riporta in 3-5 righe: titolo della feature, entità principali toccate, ruoli coinvolti,
   side effect e impatti su altre funzionalità dichiarati". Sonnet è preferito a Explore
   perché qui serve sintesi ragionata su contenuti (non solo grep/lookup), e il subagente
   deve poter leggere file interi senza la finestra di lettura ridotta di Explore. Per
   progetti piccoli, leggi direttamente.

2. **Cerca sovrapposizioni** con la spec che stai per generare. Le categorie tipiche di
   conflitto da cercare attivamente:

   - **Stessa entità, regole diverse**: la nuova spec definisce regole su un'entità
     (es. "azienda", "utente", "ordine") già governata da una spec esistente, e le due regole
     non sono compatibili (limiti diversi, permessi diversi, stati diversi).
   - **Stesso ruolo, capacità contraddittorie**: la nuova spec attribuisce a un ruolo una
     capacità che una spec esistente nega esplicitamente, o viceversa.
   - **Stesso flusso, comportamenti opposti**: la nuova spec descrive un flusso (cancellazione,
     attivazione, transizione di stato) già descritto altrove con esito diverso (es. una dice
     hard-delete, l'altra soft-delete).
   - **Side effect duplicati o incompatibili**: due spec dichiarano notifiche, contatori o log
     sullo stesso trigger ma con destinatari/contenuti diversi.
   - **Impatti laterali in collisione**: la nuova spec richiede una modifica a una feature
     esistente che un'altra spec aveva già descritto in modo diverso.
   - **Convenzioni di prodotto rotte**: la nuova spec introduce un pattern (es. "le richieste
     scadono in 7 giorni") incompatibile con un pattern già stabilito altrove (es. tutte le
     altre spec usano 30 giorni).
   - **Terminologia divergente**: la nuova spec chiama "X" qualcosa che le spec esistenti
     chiamano "Y". Non è un conflitto di logica ma genera confusione e va riconciliato.

3. **Per ogni potenziale conflitto identificato**, prepara una domanda mirata con
   `AskUserQuestion`. Non risolvere mai un conflitto autonomamente — la decisione è
   dell'utente perché spesso implica scelte di prodotto o di compatibilità che la skill
   non può conoscere.

   Struttura della domanda:
   - `header`: max 12 caratteri, es. "Conflitto"
   - `question`: descrivi il conflitto in modo concreto, citando per nome la spec esistente
     (es. `specs/eliminazione-azienda.md`) e il punto specifico (es. "§3 'Regole di business'")
     che entra in collisione con quello che stiamo per scrivere
   - `options`: tipicamente 3-4 scelte che coprono l'intero spazio di risoluzione

   Le opzioni canoniche da offrire (adatta al caso concreto):

   - **Allinea la nuova spec a quella esistente** — la nuova spec adotta la regola della
     spec esistente. Default consigliato quando la spec esistente è più recente, più usata,
     o tocca aree sensibili (compliance, sicurezza). La logica della nuova feature va
     riformulata di conseguenza.
   - **Aggiorna la spec esistente per allinearla alla nuova** — la regola della nuova spec
     prevale; la spec esistente va modificata. Documenta esplicitamente quali file/sezioni
     vanno toccati. Da consigliare quando la nuova spec corregge un errore noto della
     vecchia o quando il cambio di prodotto è intenzionale.
   - **Coesistenza esplicita con scoping diverso** — entrambe le regole rimangono valide
     ma in contesti diversi (es. "owner azienda" vs "admin di piattaforma"). Richiede di
     formalizzare lo scoping in entrambe le spec per evitare ambiguità future.
   - **Discutiamone** — l'utente vuole approfondire prima di decidere; fai follow-up
     mirato e riproponi la domanda quando hai più contesto.

4. **Salva ogni decisione** in una nota interna che userai nello Step 3:
   - Quale conflitto è stato identificato
   - Spec esistente e punto coinvolto
   - Decisione presa dall'utente
   - Eventuali modifiche da apportare a spec esistenti (file → sezione → cosa cambia)

### Quando saltare questo step

- Se `specs/` non esiste o è vuota, salta lo step (non c'è nulla con cui possa esserci
  conflitto). Annotalo internamente: "nessuna spec esistente, conflict check saltato".
- Se le spec esistenti coprono domini chiaramente disgiunti dalla nuova feature (es. stai
  scrivendo una spec su "video colloqui" e tutte le spec esistenti riguardano la
  fatturazione), puoi saltare il dettaglio ma riporta comunque all'utente la lista delle
  spec esistenti con una riga di sintesi e chiedi se vede sovrapposizioni che non hai colto.

### Cosa NON fare

- **Non risolvere conflitti senza chiedere.** Anche un conflitto apparentemente banale può
  riflettere una scelta di prodotto deliberata che non vedi.
- **Non ignorare il conflitto sperando che la review lo intercetti dopo.** La review
  adversarial successiva legge spec + codice: se due spec si contraddicono, la review non
  sa quale delle due è "giusta" e produce findings rumorosi o sbaglia direzione.
- **Non riassumere genericamente "ci sono conflitti".** Cita sempre il file e la sezione
  specifica della spec esistente — l'utente deve poter verificare leggendo il sorgente.

---

## Step 3 — Generazione spec

Quando hai tutte le risposte, genera la spec. Il formato è fisso:

```markdown
# Spec: [Nome Feature]

## Scopo
[Cosa fa la feature in 2-3 righe. Sii preciso.]

## Ruoli e permessi
[Per ogni ruolo coinvolto: cosa può fare, cosa non può fare,
limitazioni di ownership. Formato tabellare se ci sono più ruoli.]

## Regole di business
[Ogni condizione, ogni caso, ogni eccezione. Numerate.
Per ogni regola: condizione → comportamento atteso.]

## Precondizioni di flusso
[Stato richiesto del mondo prima che l'operazione possa avvenire.
Cosa succede se viene chiamata fuori sequenza.]

## Risposte attese
[Comportamento per ogni scenario:
- Successo
- Validazione fallita
- Permesso negato
- Risorsa non trovata
- Conflitto
- Ogni altro scenario emerso dalle domande]

## Side effect
[Cosa succede a latere dell'operazione principale.
Per ogni side effect: trigger, destinatario, comportamento se fallisce.
Ometti questa sezione se non ci sono side effect.]

## Impatti su altre funzionalità
[Modifiche richieste a feature ESISTENTI affinché questa nuova feature
funzioni correttamente. Per ogni impatto specifica:
- Feature impattata: nome della funzionalità esistente (es. "Registrazione azienda")
- Modifica richiesta: cosa deve cambiare in termini di business
  (es. "Il primo utente che registra un'azienda deve ricevere il permesso di invitare collaboratori")
- Motivo: perché questa modifica è necessaria alla nuova feature
  (es. "Senza questo flag, nessun utente può iniziare la catena di inviti dopo la registrazione")

Questa sezione è critica: la sua assenza equivale a "nessuna feature
esistente viene impattata da questa". Includila SEMPRE quando ci sono
impatti laterali confermati dall'utente nello Step 2 (batch "Impatti
collaterali"). Ometti la sezione SOLO se l'utente ha confermato che
nessuna feature esistente è impattata.]

## Riferimenti di design
[Includi SEMPRE questa sezione se la feature ha UI — sia quando ci sono
riferimenti, sia quando non ci sono. La sua presenza esplicita segnala
alla skill di design review se la review è applicabile o meno.

- Se l'utente ha fornito riferimenti: elencane uno per ogni stato
  significativo emerso dalle regole (default, vuoto, errore, loading,
  successo, varianti di ruolo, ecc.). Se un riferimento unico copre tutta
  la feature, va bene un solo link.
- Se l'utente NON ha fornito riferimenti: includi comunque la sezione
  con la nota esatta:
  "Nessun riferimento di design fornito — la review di design non sarà
   applicabile a questa feature."

Ometti la sezione SOLO se la feature non ha UI (es. feature backend pura,
cron job, endpoint non-interattivi).]

## Componenti di design riutilizzabili
[Solo se l'utente ha indicato componenti esistenti da riutilizzare.
Elencali come vincolo di design: la nuova feature deve riutilizzare
questi componenti dove applicabile, invece di crearne varianti nuove.
Ometti la sezione se non ci sono componenti da riutilizzare.]

## Relazione con spec esistenti
[Solo se nello Step 2.5 sono emersi conflitti o sovrapposizioni con
spec già presenti in `specs/`. Per ciascuno documenta:
- Spec coinvolta: percorso file e sezione specifica
  (es. `specs/eliminazione-azienda.md` §3 "Regole di business")
- Natura della sovrapposizione: cosa entra in collisione
- Decisione presa: allineamento alla esistente / aggiornamento della
  esistente / coesistenza con scoping / altro
- Azioni richieste su spec esistenti: se la decisione comporta modifiche
  ad altre spec, elencale puntualmente (file → sezione → cosa cambia)

Questa sezione è essenziale per le review adversarial successive: senza
di essa, la review non sa che la nuova spec sostituisce o integra una
regola precedente, e potrebbe segnalare come bug ciò che è invece
una scelta deliberata. Ometti la sezione SOLO se nello Step 2.5 non
sono emersi conflitti.]
```

### Cosa NON mettere nella spec

Le sezioni di business logic devono essere leggibili da un product owner che non conosce il
codice. Se una frase contiene un riferimento che ha senso solo per chi conosce il codebase,
riscrivila in termini di business.

**Non includere mai:**

- Nomi di tabelle, colonne o campi DB (es. `user_accounts`, `subscriptions.status`, `is_active`)
- Nomi di funzioni o servizi del codice (es. `createShareToken()`, `PaymentService.charge`)
- Endpoint HTTP, path API, metodi HTTP
- Middleware, schema di validazione, libreria di validazione
- Nomi di file sorgente (es. `email.service.ts`, `seed_data.sql`)
- Logica di webhook, retry, backoff, HTTP status code dei gateway
- Migration SQL, query, operazioni DB
- Tipi TypeScript, enum del codice
- Test, ordine di implementazione, architettura

La sezione "Riferimenti di design" può contenere link e identificativi di frame Figma o path a
file di mockup — quelli sono riferimenti a design, non a codice.

**Come riformulare:**

| Scritto male (tecnico)                                                                           | Scritto bene (business)                                                                                                |
|--------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| I piani sono definiti nella tabella `subscription_plans` con `price_cents` e `is_active`         | I piani di abbonamento hanno un prezzo e possono essere attivi o archiviati                                            |
| Il webhook `payment_intent.succeeded` accredita il balance. Su HTTP 500 c'è retry esponenziale    | Il saldo viene accreditato solo dopo conferma del gateway di pagamento. Se la conferma non arriva, il saldo non cambia |
| `user_accounts.balance` è di tipo `numeric`                                                      | Il saldo utente è espresso in valuta                                                                                   |
| Il campo `is_suspended` su `users` deve essere `false`                                           | L'utente non deve essere in stato sospeso                                                                              |
| `createShareToken(document.id)` genera il token                                                  | Alla condivisione viene generato un token di accesso unico                                                             |

La regola è: se togli tutti i nomi di tabella/funzione/endpoint dalla frase e il significato
di business resta chiaro, allora quei nomi non servivano. Se il significato si perde, stai
descrivendo implementazione, non business.

Tutto ciò che è tecnico si decide dopo, leggendo la spec.

### Revisione

Dopo aver generato la spec, rileggila e fai due passate:

**Passata 1 — Completezza:**
- Ogni regola di business emersa dalle domande è presente?
- Ci sono ambiguità residue? Se sì, chiedi prima di salvare.
- Le regole sono mutuamente consistenti? (nessuna regola ne contraddice un'altra)
- Ogni scenario di errore ha un comportamento definito?
- Se la feature ha UI, ogni stato significativo ha un riferimento di design (quando forniti)?
- Ogni impatto laterale confermato dall'utente è descritto nella sezione "Impatti su altre
  funzionalità" con feature impattata, modifica richiesta, motivo?
- Ogni conflitto emerso nello Step 2.5 è documentato nella sezione "Relazione con spec
  esistenti" con spec coinvolta, natura della sovrapposizione, decisione e azioni richieste
  su altre spec?

**Passata 2 — Pulizia tecnica:**
Cerca e rimuovi ogni riferimento tecnico dalle sezioni di business logic:
- Nomi di tabelle o colonne DB (riformula in termini di business)
- Nomi di funzioni o servizi del codice
- Logica di webhook, retry, HTTP status code
- Nomi di file sorgente
- Qualsiasi frase che avrebbe senso solo per uno sviluppatore che conosce il codebase

Se trovi un riferimento tecnico, non cancellarlo — riscrivilo. Il concetto di business
sottostante è probabilmente importante, ma va espresso senza termini implementativi.

Mostra la spec all'utente e chiedi conferma prima di salvare.

---

## Step 4 — Salvataggio

Dopo conferma dell'utente, salva la spec in:

```
specs/[nome-feature].md
```

Usa kebab-case per il nome file. Se la directory `specs/` non esiste, creala.

Comunica il percorso del file all'utente e fermati lì.

Il passo successivo è l'implementazione, che parte da questa spec. Non c'è nessuna fase
intermedia: non proporre Plan Mode, piani tecnici, scomposizioni in task o altre modalità.
Il workflow è spec → implementazione → review, e chi ti legge non sa cosa sia una modalità
di pianificazione tecnica.

---

## Regole

1. **Non assumere decisioni di business.** Se non sei sicuro, chiedi. Ogni decisione non
   esplicita è una bomba a orologeria nella spec.
2. **Solo business logic.** La spec descrive COSA, mai COME. Se ti accorgi di star scrivendo
   un nome di tabella, colonna, funzione, file, endpoint, webhook, o qualsiasi termine che
   esiste solo nel codice, fermati e riformula in termini di business. Il contesto tecnico
   serve a TE per fare domande migliori — non va nella spec.
3. **Domande in italiano, spec in italiano.** Nomi di servizi esterni (Stripe, Twilio, PayPal)
   e termini di dominio consolidati (es. "status") restano in inglese. I nomi di tabelle,
   colonne e funzioni del codice non devono comparire nella spec.
4. **La spec è il contratto per le review.** Due fasi successive di adversarial review
   leggeranno questa spec insieme al codice prodotto: una verifica l'aderenza alla business
   logic, l'altra l'aderenza al design. Scrivi la spec sapendo che è l'unico input oltre al
   codice: ogni regola, ogni risposta, ogni side effect deve essere esplicito e verificabile
   leggendo il codice. I riferimenti di design devono coprire gli stati UI significativi.
5. **Non procedere con dubbi aperti.** Se l'utente risponde in modo ambiguo, fai follow-up.
   Una spec con buchi è peggio di nessuna spec.
6. **Cerca sempre gli impatti laterali.** Una nuova feature impatta quasi sempre feature
   esistenti (registrazione, onboarding, settings, dashboard, cleanup). Durante lo Step 1
   esplora il codice cercando candidati impatti, durante lo Step 2 chiedi all'utente con
   AskUserQuestion per ciascun candidato, e durante lo Step 3 documenta gli impatti
   confermati nella sezione "Impatti su altre funzionalità". Un impatto laterale ignorato
   produce codice incompleto: la nuova feature funziona in isolamento ma il sistema nel
   suo insieme è rotto.
7. **Lean-first, ma sempre con l'alternativa conservativa esplicita.** A parità di obiettivo
   di business, la spec deve proporre per primo il flusso più semplice da implementare —
   meno entità, meno stati, meno integrazioni. L'opzione "(Consigliato)" in ogni
   `AskUserQuestion` è quella lean. **Tuttavia l'opzione conservativa va SEMPRE inclusa
   come scelta esplicita nella stessa domanda**, descritta lealmente con i suoi trade-off;
   non va mai omessa. Lean-first è un suggerimento di default, non un filtro che nasconde
   alternative legittime. L'utente sceglie informato. In aree con vincoli potenzialmente
   obbligatori (GDPR/dati personali, pagamenti, autenticazione, operazioni distruttive,
   dati sanitari/minori, comunicazioni esterne) l'alternativa conservativa va proposta
   anche se l'utente non l'ha menzionata, perché omettere quelle alternative rischia di
   produrre spec incompatibili con vincoli legali o di sicurezza reali del contesto utente.
   Vedi sezione "Principio: lean-first per progetti greenfield" per esempi e pattern.
8. **Controlla sempre i conflitti con spec esistenti.** Le spec già presenti in `specs/`
   sono il contratto vigente del prodotto: scrivere una nuova spec che le contraddice senza
   dichiararlo produce sistemi in cui due regole opposte coesistono e nessuna review riesce
   a dire quale sia quella "giusta". Lo Step 2.5 è obbligatorio quando `specs/` esiste e
   contiene file: leggi tutto, identifica sovrapposizioni concrete (stesse entità, stessi
   ruoli, stessi flussi, stessi side effect, terminologia divergente), e per ciascuna fai
   decidere all'utente con `AskUserQuestion`. Documenta le decisioni nella sezione
   "Relazione con spec esistenti" della spec finale, citando file e sezione precisa.
   Mai risolvere un conflitto autonomamente: la scelta è di prodotto.

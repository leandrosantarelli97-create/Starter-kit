---
name: adversarial-review-business
description: |
  Esegue una review severa di una feature implementata a partire da una spec di business logic.
  Verifica aderenza alla spec, edge case non gestiti e rischi di sicurezza, producendo report
  markdown e JSON con findings per severity. Usala dopo una feature spec-driven, prima del merge.
---

# adversarial-review-business

Verifica che il codice appena scritto rispetti la spec di business e sia privo di bug e buchi
di sicurezza. La review è **adversarial**: il tuo obiettivo è trovare problemi, non confermare
che vada bene. Parti dall'assunto che il codice sia sbagliato finché non dimostri il contrario
leggendo la spec riga per riga.

La skill confronta due input:
- **La spec** prodotta dalla skill `crea-spec` (in `specs/<nome>.md`), che definisce il contratto
  di business logic: ruoli, regole, precondizioni, risposte attese, side effect.
- **Il diff di codice** tra la base del diff e HEAD (di norma l'ultimo commit), che rappresenta
  l'implementazione da revisionare.

Il risultato è un report markdown in `specs/<nome>-review.md` con i findings organizzati per
severity.

---

## Step 1 — Identifica spec e diff

### Chiedi quale spec usare

Usa `AskUserQuestion` per farti indicare quale spec usare come contratto. Lista i file presenti
in `specs/` come opzioni. Se `specs/` non esiste o è vuota, comunica all'utente che la review
non è applicabile: questa skill richiede una spec di business logic come contratto.

Se esiste già un file `specs/<nome>-review.md` per la spec scelta, chiedi se sovrascriverlo o
creare un file versionato (`<nome>-review-2.md`, ecc.).

### Determina il punto di partenza del diff

La base la ricavi da sola: **è il commit in cui la spec è entrata nel repo**. Il metodo è spec
prima, implementazione dopo, quindi tutto ciò che viene dopo quel commit è l'implementazione di
quella spec. Non chiedere all'utente quale commit usare: è un'informazione che spesso non ha.

Nell'ordine:

1. **L'utente ha indicato un branch o un commit**: usa quello.
2. **Altrimenti** parti da `git log -1 --format=%H -- <path-spec>`, il commit che ha toccato per
   ultimo la spec:
   - se dopo quel commit ce ne sono altri, è lui la base;
   - se è l'ultimo commit — spec e implementazione committate insieme, o implementazione ancora
     non committata — la base è il suo genitore (`<commit>^`);
   - se non ha genitore, cioè è il primo commit del repo, revisionalo per intero.
3. **La spec non è mai stata committata**: la base è `HEAD` e ciò che si revisiona sono le
   modifiche non committate.
4. **Non siamo in un repo git**: chiedi all'utente dove sta il codice da revisionare.

Dichiara cosa stai per revisionare prima di partire — «review di quello che è stato fatto dopo
*oggetto del commit della spec*» — e vai avanti senza aspettare conferma. Se hai preso il pezzo
sbagliato l'utente ti corregge, e costa meno che rispondere a una domanda.

Con questa base il diff può contenere anche commit che non c'entrano con la feature. È previsto:
il filtro per pertinenza qui sotto li toglie.

### Calcola il diff e la lista file

Modalità default: esegui `git diff --name-status <base>...HEAD` per ottenere la lista dei file
modificati, aggiunti o eliminati. Poi `git diff <base>...HEAD -- <file>` per ogni file per avere
il diff completo. Se la base è un commit e non un branch, usa due punti (`<base>..HEAD`).

Se il working tree ha modifiche non ancora committate, fanno parte di ciò che va revisionato:
rifai gli stessi comandi senza `...HEAD` (`git diff --name-status <base>`) per includerle.

Modalità alternativa: se l'utente ha fornito esplicitamente un diff (es. patch scaricata da un
PR, path a una directory di fixture) oppure se non siamo in un repo git, usa l'input fornito
invece di `git diff`. In test/fixture consideri tutti i file indicati come "codice modificato".

Filtra i file per pertinenza alla spec. Alcuni file nel diff potrebbero non avere nulla a che
fare con la feature specificata (es. un fix di formattazione su un altro modulo). **Entrambe le
sotto-review (business+bug, security) sono limitate al codice che implementa la spec.** Se un
file sembra estraneo:
- Escludilo da tutte le sotto-review.
- Segnala in fondo al report cosa hai escluso e perché, così l'utente sa cosa è rimasto
  fuori dall'analisi.

Questa skill non è un linter né un security scanner del repo: il suo valore sta nel verificare
che l'implementazione della spec sia corretta e sicura — non nel revisionare tutto il codebase
ad ogni invocazione. La verifica visiva del frontend rispetto a mockup/design non è in scope:
per quella usa una skill o un flusso dedicato.

Se il diff è vuoto, fermati: non c'è nulla da revisionare.

---

## Step 2 — Analisi parallela (2 subagenti)

Lancia i subagenti **in parallelo** con il tool `Agent` (tipo `general-purpose`), uno per area.
Ogni subagente ha un compito focalizzato e restituisce findings in formato strutturato. La
parallelizzazione serve sia per velocità sia per rigore: ogni subagente legge con la lente della
propria area senza essere distratto dall'altra.

**Importante — modello dei subagenti.** Quando invochi il tool `Agent`, **non impostare il
parametro `model`**. Lasciando il campo vuoto il subagente eredita automaticamente lo stesso
modello (e la stessa finestra di contesto) del capitano che lo ha lanciato, garantendo
capacità di ragionamento e ampiezza di contesto omogenee in tutta la pipeline di review.
Sovrascrivere il modello con uno più piccolo (es. `"sonnet"` o `"haiku"`) per risparmiare
token può far sfuggire findings sottili; per default non farlo.

**Le due sotto-review sono sempre attive**: business+bug (un unico reviewer a doppia lente che
verifica sia l'aderenza alla spec sia la correttezza funzionale del codice) e security.

Passa a ciascun subagente — nel prompt testuale, non leggere i file tu stesso:
- Il percorso completo della spec
- La lista dei file del diff con stato (A/M/D)
- Il diff completo (o istruzioni per ricalcolarlo)
- Il **path** del file `agents/reviewer-<area>.md` che contiene le istruzioni dettagliate per il
  subagente, con l'indicazione esplicita di leggerlo come prima operazione e di seguirlo alla
  lettera. Non leggere tu stesso quel file: lasciandone la lettura al subagente, il suo contenuto
  finisce nel contesto del subagente (che è separato dal tuo) invece che nel tuo, mantenendo il
  tuo contesto di capitano snello e dedicato all'orchestrazione. Stesso principio per
  `agents/finding-format.md`: è referenziato dai reviewer file, il subagente lo leggerà da sé
  quando serve.

Ogni subagente restituisce una lista JSON di findings. Il formato è definito in
`agents/finding-format.md` (lo legge il subagente all'avvio, non tu).

**Template del prompt da passare a ogni subagente:**

```
Sei un reviewer adversarial focalizzato su <area>. Prima di iniziare, leggi per intero il file
<path-assoluto-del-file-reviewer> — contiene le tue istruzioni operative complete, la checklist
e il formato di output. Seguile alla lettera.

Contesto per il tuo task:
- Spec di riferimento: <path-spec>
- Base del diff: <base> (branch o commit)
- File nel diff (con stato): <lista>
- Diff completo: <inline, o "esegui git diff <base>...HEAD">

Restituisci l'output richiesto dal file di istruzioni. Non produrre altro.
```

### Sotto-review 1: Business vs Spec + Bug ed edge case (reviewer a doppia lente)
Istruzioni per il subagente: `agents/reviewer-business.md`. Non leggerlo tu — passane il path
nel prompt.

Obiettivo: due lenti complementari **entrambe limitate al codice che implementa la spec**,
eseguite dallo stesso subagente.
- **Lente Business**: per **ogni** regola di business, ruolo, precondizione, risposta attesa e
  side effect della spec, verificare che il codice la implementi correttamente. Trovare
  omissioni, distorsioni e implementazioni parziali.
- **Lente Bug (sul codice della spec)**: trovare bug nei flussi/funzioni/componenti che
  implementano la spec — null/undefined non gestiti, off-by-one, race condition, input non
  validati, stati incoerenti, errori swallowed, logica di controllo sbagliata. **Non è una
  review generica della web app**: bug in codice del diff estraneo alla spec non sono in
  scope.

I findings vengono restituiti nello stesso array JSON, distinti dal campo `category`
(`"business"` o `"bug"`). Le due lenti sono unite in un unico subagente perché condividono lo
stesso scope (la spec implementata) e si rinforzano a vicenda: l'analisi della spec aiuta a
capire cosa il codice dovrebbe fare, e l'analisi dei bug aiuta a capire dove anche
un'implementazione formalmente corretta della spec si rompe sotto input avversi.

### Sotto-review 2: Security
Istruzioni per il subagente: `agents/reviewer-security.md`. Non leggerlo tu — passane il path
nel prompt.

Obiettivo: trovare buchi di sicurezza nel codice che implementa la spec — auth/authz bypass,
injection, leak di dati sensibili, validazione mancante ai confini, secret esposti, IDOR,
mancanza di rate limit su endpoint sensibili. **Lo scope è limitato ai confini di sicurezza
introdotti o modificati dal diff dentro i flussi della spec**, non una review di sicurezza
generica della web app.

---

## Step 3 — Consolida il report

Ricevuti i findings dai due subagenti, uniscili in un unico report con questo formato:

```markdown
# Review: [Nome Feature]

**Spec:** specs/<nome>.md
**Base:** <base>
**Data:** YYYY-MM-DD
**Findings totali:** N (Critical: x, High: y, Medium: z, Low: w)

## Sommario esecutivo

[2-3 righe. Quanti findings, severity peggiore, se il codice è mergeable o richiede correzioni
bloccanti. Sii diretto: se ci sono findings Critical, scrivilo.]

## Findings

### Critical

#### F-01 | [Business | Bug | Security] | <titolo breve>

**File:** `path/to/file.ext:L<inizio>-L<fine>`
**Regola violata:** [solo per findings Business — cita testualmente la regola dalla spec]
**Descrizione:** Cosa c'è nel codice e perché è sbagliato rispetto alla spec / rispetto a buone
pratiche di programmazione / rispetto alla sicurezza.
**Evidenza:**
\`\`\`<lang>
<snippet codice rilevante>
\`\`\`
**Impatto:** Cosa può succedere in produzione se non si corregge (scenario concreto, non
generico).
**Suggerimento:** Indicazione breve di cosa andrebbe fatto. Non scrivere il fix completo —
segnala la direzione.

#### F-02 | ...

### High

...

### Medium

...

### Low

...

## Note sul diff analizzato

- Base: <base>
- File modificati totali: N
- File inclusi nell'analisi business-vs-spec: <lista>
- File esclusi dall'analisi business (ma inclusi in bug/security): <lista con motivo>
```

### Regole di consolidamento

- **Dedup solo per problemi identici nello stesso punto di codice.** Se due subagenti
  segnalano lo stesso problema sullo stesso file:riga, uniscili in un unico finding e nota le
  categorie multiple (es. `[Business + Security]`).
- **NON consolidare manifestazioni separate dello stesso problema logico.** Se un difetto di
  progettazione si manifesta in punti diversi del codice (es. "accredito fatto nel controller
  prima del tempo" + "webhook che non accredita al momento giusto" = stesso flusso invertito,
  ma due punti di intervento), produci **findings separati** per ciascuna manifestazione. Chi
  fixa deve vedere tutti i posti da toccare, altrimenti rischia di correggerne uno e lasciare
  l'altro rotto. Puoi aggiungere un riferimento incrociato nella `description` ("correlato a
  F-0X"), ma i finding restano distinti.
- **Numerazione continua.** F-01, F-02, ... senza buchi, ordinati per severity (Critical prima)
  e poi per file.
- **Ricalibra le severity prima di scrivere il report.** Per default usi quella dei subagenti,
  ma applica il cancello concreto del livello critical (vedi `agents/finding-format.md`):
  un finding marcato `critical` deve passare i tre test (exploit/rottura concreta non
  ipotetica; trigger raggiungibile dal sistema oggi senza catene di altri bug; vittima diversa
  dall'attore o danno sistemico). Se anche uno solo non passa, **declassa a high**. È normale
  che un subagente paranoico gonfi la severity per non perdere niente — il consolidamento è il
  punto in cui ricalibri. Se declassi, dillo in una riga in fondo al messaggio di chiusura,
  senza spiegare i tre test: quanti problemi erano stati proposti come gravissimi e quanti lo
  sono davvero. Nel report non va.
- **In caso di categorie multiple, prendi la peggiore** dopo la ricalibrazione.

### Salvataggio

Salva il report in `specs/<nome-spec>-review.md` (es. se la spec è `specs/user-sharing.md`, il
report va in `specs/user-sharing-review.md`).

### Il messaggio di chiusura

Il report lo leggerà l'agente che scrive i fix. **Il messaggio in chat lo legge una persona**,
la stessa che ha chiesto la review e che adesso deve decidere se correggere, e non legge codice:
conosce il proprio prodotto, non la sua implementazione. Scrivilo come il sommario esecutivo, non
come l'elenco dei findings.

Contiene, in quest'ordine:

1. **Il verdetto in una riga.** Si può mandare in produzione oppure no, e quanti problemi sono
   stati trovati per gravità.
2. **Un punto per ogni problema grave.** Sempre i Critical e gli High; i Medium solo se fanno
   perdere dati, denaro o l'accesso a qualcosa di pagato. Il resto resta nel file.
3. **Dove sta il report**, e a cosa serve: dentro, ogni problema ha scritto come si chiude,
   ed è il file da dare all'agente quando si decide di correggere.

Ogni punto dice tre cose e nient'altro: **cosa può succedere, a chi, e in quali condizioni.**
Se ti accorgi di aver scritto perché succede, stai scrivendo il report un'altra volta.

**Fuori dal messaggio**, senza eccezioni: nomi di file e numeri di riga, nomi di funzioni,
tabelle, colonne, componenti, librerie e servizi, sigle e codici d'errore, unità di misura
tecniche, frammenti di codice. Se una frase non si capisce togliendo quelle parole, va
riscritta partendo da cosa vede l'utente dell'applicazione.

Esempio della differenza, sullo stesso finding:

> **No:** il tetto di 20.000 caratteri copre solo `body`, ma la select legge tutto `CAMPI` e
> `generated_digest` non ha vincoli, quindi il conto dei 16 MB per blocco è falso.

> **Sì:** un utente può far occupare al server molta più memoria del previsto scrivendo molto
> testo in un contenuto, e in quel caso l'applicazione smette di rispondere a tutti. Basta un
> account normale, senza niente di costruito ad arte.

Due avvertenze sul tono. **Non ammorbidire**: tradurre in linguaggio di prodotto vuol dire
togliere il gergo, non la gravità, e un problema che blocca il merge si dice che blocca il
merge. E **niente rimedi nel messaggio**: come si chiude un problema sta scritto nel finding
che lo descrive. Il messaggio serve a decidere se correggere, il report a correggere.

---

## Principi della review

1. **Sei adversarial, non simpatico.** Il tuo job è trovare problemi. Se hai dubbio se una cosa
   sia un finding o no, segnalala con severity bassa invece che ometterla. Un finding di troppo
   è irritante; un finding mancante può far passare un bug in produzione.

2. **Ogni finding deve essere verificabile.** File, numero di riga, snippet di codice. Niente
   "forse qui c'è un problema" senza coordinate. Se non puoi puntare al codice, non stai
   segnalando un finding — stai speculando.

3. **La spec è il contratto, non la tua opinione.** Se la spec dice "l'utente deve avere saldo
   > 0", non importa se tu pensi che dovrebbe essere ≥ 0. Verifica che il codice implementi
   ciò che la spec dice, non ciò che tu pensi sia giusto. Se trovi un'ambiguità **nella spec**,
   segnalala come nota separata in fondo al report (non come finding).

4. **Impatto prima di stile.** Non sprecare findings su cose stilistiche (naming, formatting,
   commenti) a meno che non abbiano impatto sulla correttezza. Questa non è una review di
   quality — è una review di correttezza.

5. **Non applicare fix.** Questa skill è **solo diagnosi**. Non modificare file, non lanciare
   linter/formatter, non proporre patch complete. Il suggerimento breve va bene; scrivere il
   codice del fix no.

6. **Nessun limite di profondità o volume.** Una feature reale tocca regolarmente decine di
   file — è la norma. Nessun subagente deve mai trattare un diff "grande" come caso
   eccezionale: niente campionamento, niente "mi concentro sui più critici", niente richieste
   all'utente di restringere lo scope. Tutti i file pertinenti vanno analizzati in profondità,
   con la stessa rigorosità, fino in fondo. Il tempo necessario è il tempo giusto. Se un
   subagente si sente tentato di riassumere o saltare, sta facendo il suo lavoro male.

---

## Edge case e scenari particolari

- **Spec non trovata:** Comunica che la skill richiede una spec in `specs/`. Proponi di
  generarne una con la skill `crea-spec`.
- **Diff vuoto:** Non c'è nulla da revisionare. Fermati.
- **Dimensione del diff:** Non c'è nessuna soglia oltre la quale la review va ridimensionata o
  affrettata. Spec reali toccano regolarmente decine di file — è la normalità, non un'eccezione.
  I subagenti devono andare in profondità su **ogni** file del diff pertinente, senza campionare,
  senza limitare l'analisi per "risparmiare tempo" e senza chiedere all'utente di restringere lo
  scope. Se il volume è grande, accetta il tempo necessario e procedi completo. Mai saltare file,
  mai riassumere superficialmente, mai dichiarare "review parziale per dimensione".
- **Spec senza UI menzionata nel codice modificato:** Se la spec descrive business logic pura
  ma il diff tocca solo frontend (o viceversa), segnala la discrepanza come nota e procedi
  comunque con l'analisi.
- **File binari nel diff:** Ignorali (immagini, font, ecc.) — la review è solo per codice
  testuale.

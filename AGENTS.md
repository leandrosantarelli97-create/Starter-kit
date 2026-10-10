<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Regole per il coding agent

Web app costruita nel corso Vibe Coding di AI Builders Italia. Stack:
Next.js (App Router, TypeScript), Supabase (DB/Auth/Storage), Tailwind,
Vercel. AI tramite `lib/ai` (mock di default, OpenAI opzionale). Stripe e
Brevo nel binario SaaS.

## Product Spec

- Le spec in `specs/` sono la fonte di verità del prodotto in questo momento.
  Prima di implementare, leggi le spec correlate a ciò che tocchi.
- Non inventare decisioni di prodotto mancanti: se la spec non copre un caso,
  fermati e chiedi.
- Quando chiedi, chiedi **a livello di prodotto**: descrivi il caso e chiedi cosa
  deve succedere, non come modellarlo né quale opzione tecnica preferisce. Chi ti
  legge conosce il proprio prodotto, non il codice. Se una decisione è solo
  tecnica e il comportamento non cambia, prendila tu.
- Se durante il lavoro il prodotto cambia, prima si aggiorna la spec, poi
  l'implementazione.

## Sicurezza (non negoziabile)

- Segreti solo server-side. Mai `NEXT_PUBLIC_` per valori sensibili, mai
  segreti nel codice o nelle response API.
- Ogni input esterno (form, query param, body delle API) si valida con Zod
  lato server. I controlli client-side sono solo UX, non un confine di
  sicurezza.
- Authentication verificata server-side su ogni operazione protetta;
  authorization vicino ai dati. RLS attiva su ogni tabella a cui il client
  accede direttamente.
- Lato server l'utente si legge **solo** con `supabase.auth.getUser()`, mai con
  `getSession()`: la sessione arriva da un cookie, e un cookie lo fabbrica
  chiunque. `getUser()` fa verificare il token a Supabase, `getSession()` si
  fida di quello che gli è stato passato.
- Il proxy Next.js (`proxy.ts`, che nelle versioni precedenti si chiamava
  `middleware.ts`) serve solo per gating e redirect, non come unico controllo
  di accesso.
- Testo scritto dall'utente — o letto dal database, che è la stessa cosa — non
  finisce mai dentro le istruzioni di sistema del modello. `lib/ai` ha due campi
  distinti apposta: `system` per le istruzioni, `prompt` per il materiale. Vale
  anche per i campi del brand: il tono di voce è materiale, non istruzione.
- Nel `prompt`, il testo dell'utente va delimitato e le istruzioni di sistema
  devono dichiarare che eventuali ordini contenuti nel materiale si ignorano.
  Separare i due campi non basta: un modello a cui non hai detto niente esegue
  volentieri le istruzioni che trova nel messaggio dell'utente.
- Quello che il modello produce non fa mai partire un'azione da solo. Il testo
  generato torna all'utente, che lo rilegge: non diventa una query, una chiamata
  a un tool, un'email o una scrittura sul database senza passare da lui.
- Upload: valida MIME type e dimensione, nomi/path generati dal sistema,
  bucket privati con accesso via RLS.
- Webhook Stripe: body con `request.text()`, header `Stripe-Signature`,
  `stripe.webhooks.constructEvent(...)`; processa l'evento solo a verifica
  riuscita.

## Errori

- **Un errore ingoiato non esiste.** Prima di trasformarlo in un messaggio per
  l'utente, scrivilo con `console.error` insieme al contesto: quale operazione,
  su quale identificativo. Vale per ogni `catch`, per ogni `error` che torna dal
  database e per ogni risposta di errore che costruisci.
- Il messaggio all'utente e la riga di log sono due cose diverse. Il primo dice
  che cosa è cambiato e che cosa può fare adesso, senza dettagli tecnici; la
  seconda dice che cosa è andato storto e dove. Un `catch` che restituisce solo
  il primo lascia chi gestisce l'applicazione senza niente in mano.

## Database

- La secret key scavalca la RLS, **non i permessi di tabella**: sono due
  controlli diversi. Ogni migration che crea una tabella, o che apre una strada
  nuova a un ruolo, dichiara i `grant` per ogni ruolo che dovrà usarla —
  `authenticated` per ciò che passa dal browser, `service_role` per ciò che il
  server fa con la secret key. Concedi le operazioni che servono davvero, mai
  `all`.
- Ogni modifica allo schema passa da una migration SQL tracciata nel repo:
  l'agente la genera in `supabase/migrations/`, lo studente la revisiona e la
  applica eseguendola nel SQL Editor del dashboard Supabase. Non usare la CLI
  Supabase, non proporre `db push`.
- Supabase MCP in sola lettura: niente modifiche dirette al database.
- Prima di toccare la production, valuta esplicitamente i rischi di perdita
  dati.

## Git

- Solo operazioni non distruttive: niente force push, reset --hard, checkout
  che scarta modifiche, cancellazione di branch non richiesta.
- Commit dopo ogni implementazione revisionata. Mai bypassare il pre-commit
  (`--no-verify` vietato): se blocca, il problema si risolve, non si aggira.

## Workflow

- Feature nuove: prototipo (se serve) → spec con la skill `crea-spec` →
  implementazione → review con la skill `adversarial-review-business` → fix →
  commit. La review si ripete finché non restano finding Critical o High.
- **La review non la fai tu.** Chi ha scritto il codice non è in grado di
  revisionarlo: la review gira in una sessione separata, che avvia l'utente.
  Quando hai finito di implementare fermati lì — non lanciare la skill di
  review e non proporre di lanciarla.
- I comportamenti dell'abbonamento che non si raggiungono cliccando (il rinnovo
  rifiutato, il termine per rimediare, la disdetta a pagamento sospeso) si
  provano con la skill `prova-abbonamento`, che guida l'utente scenario per
  scenario. Codice revisionato non vuol dire codice eseguito.
- Prima di disegnare una schermata, nel prototipo o nel prodotto, leggi
  `prototipo/DESIGN.md`: token, regole non negoziabili e pattern sono già
  decisi. Se una tua proposta li contraddice, vince il file.
- Non inventare agent custom. Quelli che trovi in `.claude/agents/` fanno parte
  del kit e si usano: `collega` va invocato quando lo studente è bloccato su
  un **esercizio del corso**, o quando ne ha finito uno e vuole sapere se l'ha
  implementato bene. Solo per quello — non è un aiutante generico, e per i bug
  del codice che si sta scrivendo adesso non serve.
- Preferisci la soluzione più semplice che soddisfa il requisito attuale;
  aggiungi complessità solo quando serve.

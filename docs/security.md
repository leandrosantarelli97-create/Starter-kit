# Sicurezza

Le regole di sicurezza del progetto. Il coding agent le conosce (sono
riassunte in `AGENTS.md`) e quattro hook automatici in `.claude/hooks/`
bloccano le violazioni più comuni mentre si lavora.

## Segreti

- I segreti (API key, chiavi Stripe, ecc.) vivono solo in `.env.local`, che
  git ignora. Mai nel codice, mai committati: il pre-commit li blocca.
- Le variabili `NEXT_PUBLIC_*` finiscono nel browser e sono visibili a
  chiunque. Vanno usate solo per valori davvero pubblici (l'URL di Supabase,
  la publishable key). Un segreto con prefisso `NEXT_PUBLIC_` è un segreto
  pubblicato.
- Le response delle API non devono mai contenere variabili d'ambiente.

## Il client non è un confine di sicurezza

- Qualunque controllo fatto nel browser (nascondere un bottone, validare un
  form) è solo esperienza utente: chiunque può aggirarlo.
- I controlli veri stanno sul server: authentication verificata su ogni
  operazione protetta, authorization vicino ai dati, input validati con Zod.
- Authentication = chi sei. Authorization = cosa puoi fare. Servono entrambe.

## Row Level Security (RLS)

- Ogni tabella a cui il client accede direttamente ha RLS attiva: è il
  database stesso a garantire che ognuno veda solo i propri dati.
- Principio del minimo privilegio: le policy concedono solo ciò che serve.

## Upload di file

- Bucket privati, accesso tramite RLS.
- Validare MIME type e dimensione lato server; nomi e percorsi dei file
  generati dal sistema, mai presi dall'utente.

## Webhook Stripe *(binario SaaS)*

- Verificare sempre la firma: body grezzo con `request.text()`, header
  `Stripe-Signature`, `stripe.webhooks.constructEvent(...)`.
- Processare l'evento solo a verifica riuscita. Senza questo controllo,
  chiunque può fingersi Stripe e attivarsi un piano a pagamento gratis.

## Checklist prima del go live

- [ ] Nessun segreto nel codice o nella storia git
- [ ] RLS attiva e testata su tutte le tabelle esposte al client
- [ ] Tutte le operazioni protette verificano l'utente server-side
- [ ] Input esterni validati con Zod su ogni API
- [ ] Webhook Stripe con verifica della firma *(binario SaaS)*
- [ ] Variabili d'ambiente di production separate da quelle di sviluppo

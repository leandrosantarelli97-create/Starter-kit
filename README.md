# Vibe Coding — Starter Kit

Il punto di partenza del corso **Vibe Coding** di AI Builders Italia: da qui
costruirai la tua web app, una milestone alla volta, fino a portarla online.
Quale app sarà lo decidi tu: questa base non presuppone nulla sul prodotto.

## Requisiti

- [Node.js](https://nodejs.org) (versione LTS)
- [Git](https://git-scm.com)
- [Claude Code](https://claude.com/claude-code)

Tutto il resto (Supabase, OpenAI, Stripe, Brevo) si aggiunge durante il
corso, nel momento in cui serve. Per partire non serve nessun account e
nessuna API key.

## Avvio

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000): se vedi la pagina di
benvenuto, funziona tutto.

## Cosa c'è dentro

- **`app/`** — le pagine dell'app (per ora solo la homepage).
- **`lib/ai/`** — la generazione di testo AI. Parte in **mock mode**
  (risposte finte, costo zero, nessuna key): si passa a OpenAI nel Modulo 3
  cambiando `AI_PROVIDER` in `.env.local`.
- **`lib/supabase/`** — i client per il database (si configura nel Modulo 2).
- **`specs/`** — le Product Spec, la fonte di verità del prodotto.
- **`docs/`** — architettura, sicurezza e ambienti.
- **`AGENTS.md`** — le regole che il coding agent segue in questo progetto
  (`CLAUDE.md` punta qui).
- **`.claude/skills/`** — le skill del metodo: `crea-spec` e
  `adversarial-review-business`.
- **`.claude/hooks/`** — controlli automatici di sicurezza: bloccano segreti
  nel client, `NEXT_PUBLIC_` sospetti, env nelle response API e webhook
  Stripe senza verifica della firma.
- **`.claude/agents/collega`** — il collega che questo lavoro l'ha già fatto.
  Alcune schermate le costruisci da solo, come esercizio: se ti blocchi, o se
  hai finito e vuoi sapere se l'hai fatta bene, lui va a vedere come è risolta
  nel progetto di riferimento del corso e te lo spiega a parole. Non devi aprire
  GitHub né leggere codice: basta dirlo, *"sono bloccato sulla Panoramica, vai a
  vedere come è risolta e dimmi come sbloccarmi"*.
- **`.githooks/`** — il pre-commit che impedisce di committare file `.env`
  e API key. Si attiva da solo con `npm install`.

## Configurazione

Copia `.env.example` in `.env.local` e compila i valori man mano che il
corso li introduce. `.env.local` contiene i tuoi segreti: git lo ignora, e
deve restare così.

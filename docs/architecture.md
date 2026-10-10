# Architettura

Conoscenza tecnica stabile del progetto. Si aggiorna solo quando cambia una
decisione di architettura, non a ogni feature.

## Lo stack

| Pezzo | Cosa fa | Servizio |
| --- | --- | --- |
| Next.js (App Router, TypeScript) | Frontend + backend nella stessa app | Vercel |
| Supabase | Database PostgreSQL, autenticazione, file storage | Supabase |
| Tailwind CSS | Stili | — |
| `lib/ai` | Generazione testo AI (mock o OpenAI) | OpenAI (dal Modulo 3) |
| Stripe | Pagamenti e abbonamenti *(binario SaaS)* | Stripe |
| Brevo | Email transazionali *(binario SaaS)* | Brevo |

## Come sono organizzati i file

```
app/            Le pagine e le API. Ogni cartella è un pezzo di URL:
                app/page.tsx è la homepage, app/api/*/route.ts sono le API.
lib/            Codice condiviso che non è una pagina.
lib/supabase/   I client per parlare con Supabase:
                client.ts per il browser, server.ts per il server.
lib/ai/         L'astrazione del provider AI: generateText() con
                AI_PROVIDER=mock (default) oppure openai.
public/         File statici serviti così come sono (immagini, icone).
prototipo/      Le schermate in HTML disegnate prima di costruire: non è
                l'app, è la sua forma (lo disegni nel Modulo 2).
specs/          Le Product Spec: cosa fa il prodotto e perché.
docs/           Questa documentazione tecnica.
supabase/       Le migration SQL del database (le scrivi nel Modulo 2).
.claude/        Skill, hook e agent per il coding agent. In agents/ c'è
                `collega`: quando sei bloccato su un esercizio, o vuoi
                sapere se l'hai fatto bene, va a guardare come è risolto nel
                progetto di riferimento del corso e te lo spiega.
.githooks/      Il pre-commit che blocca segreti e file .env.
.mcp.json       Il collegamento in sola lettura al tuo Supabase, per far
                leggere il database all'agente (si attiva nel Modulo 2).
```

## Le regole di fondo

- **Il server è il confine.** Tutto ciò che è sensibile (segreti, controlli
  di accesso, chiamate AI, Stripe) vive in codice server: Server Component,
  Route Handler, Server Action. Il browser riceve solo ciò che può vedere.
- **Un solo punto di ingresso per l'AI.** Ogni generazione passa da
  `lib/ai/generateText()`: cambiare provider è una variabile d'ambiente, non
  una riscrittura.
- **Il database si cambia con le migration.** Mai cliccando nel Table Editor:
  ogni modifica allo schema è un file SQL nel repo, che si revisiona e poi si
  esegue nel SQL Editor. Se una modifica non ha lasciato un file, non è mai
  successa.
- **Semplice finché basta.** Niente astrazioni o dipendenze nuove finché il
  requisito attuale non le richiede.

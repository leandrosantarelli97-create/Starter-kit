# Ambienti

Come sono separati sviluppo e produzione, e dove vivono le configurazioni.

## I due ambienti

| | Sviluppo | Production |
| --- | --- | --- |
| Dove gira | Il tuo computer (`npm run dev`) | Vercel |
| Database | Progetto Supabase di sviluppo | Progetto Supabase separato (Modulo 5) |
| Variabili | `.env.local` | Environment Variables su Vercel |
| Stripe | Test mode | Live mode (Modulo 5) |
| AI | `AI_PROVIDER=mock`, poi `openai` | `openai` |

Due progetti Supabase separati significa che nessun esperimento in sviluppo
può toccare i dati veri degli utenti.

## Le variabili d'ambiente

- `.env.example` è il catalogo: elenca tutte le variabili che l'app conosce,
  senza valori segreti. È l'unico file `.env*` committato.
- `.env.local` è la tua copia con i valori veri. Git la ignora e il
  pre-commit la blocca se provi a committarla.
- Su Vercel le stesse variabili si impostano da dashboard
  (Settings → Environment Variables), con i valori di production.

## Le migration tra ambienti

Le migration SQL in `supabase/` sono la storia del database: si applicano
prima in sviluppo, e solo quando sono verificate si applicano al progetto
di production (Modulo 5). Stesso file, due ambienti: mai modifiche a mano
solo su uno dei due.

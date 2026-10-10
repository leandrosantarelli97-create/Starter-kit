# Database

Qui vivono le **migration**: i file SQL che cambiano il database. Ogni file è
un pezzo della sua storia, in ordine, dal primo giorno a oggi.

La regola che tiene insieme tutto: se una modifica al database non ha lasciato
un file qui dentro, non è mai successa. Il giorno in cui servirà ricostruire
il database da zero — e servirà, quando nel Modulo 5 nasce il progetto di
production — si rieseguono questi file in ordine e si ottiene lo stesso
identico database.

## Come si applica una migration

1. L'agente scrive il file in `migrations/`.
2. Tu lo leggi. Non riga per riga: guarda se ci sono le tabelle che ti
   aspetti, se ognuna ha un proprietario, se manca qualcosa che nel prototipo
   si vede.
3. Lo incolli nel **SQL Editor** del dashboard Supabase e lo esegui.

Ogni file si esegue una volta sola, nell'ordine dei nomi. Non si usa la CLI
Supabase: sarebbe un'installazione, un login e la password del database da
recuperare, per fare la stessa cosa.

## Cosa non si fa

Cambiare il database cliccando nel **Table Editor**. È comodo, funziona, e
lascia il repo che racconta una storia diversa da quella vera: da lì in poi
nessuno sa più com'è fatto davvero il database. Il dashboard non è il
problema — lo è la modifica che non lascia un file.

Le prime migration le scriverai nel Modulo 2.

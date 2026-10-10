# Prototipo

Qui vivono le schermate del prodotto in HTML statico: niente database, niente
login, dati finti scritti a mano. Non è l'app — è la sua forma, il posto dove
decidere com'è fatto il prodotto mentre costare un ripensamento è ancora zero.

Serve a rispondere a una domanda che a parole non si risolve: **questa cosa,
guardandola, funziona?** Le schermate rendono visibili le decisioni che
un'idea in testa lascia sfumate, e ogni buco che si vede qui è un buco in meno
nel database.

## Cosa c'è già qui

- `DESIGN.md` — le decisioni di design del progetto: colori, tipografia, le
  cinque regole non negoziabili e i pattern schermata per schermata. Sono
  scritte prima perché nascono da una ricognizione su una libreria di
  riferimenti a pagamento: quel lavoro è già fatto, tu parti da qui.
- `assets/tailwind-config.js` e `assets/proto.css` — i token e i componenti
  (`.btn`, `.field`, `.chip`, `.label`…) che `DESIGN.md` descrive.

Le schermate e il loro `assets/proto.js` li scrivi tu nel Modulo 2.

## Come si usa

Si apre un file `.html` col doppio click nel browser. Nessun server da
avviare, nessuna installazione: è la ragione per cui il prototipo si può
rifare dieci volte in un pomeriggio.

## Regole

- Il prototipo non chiama nessuna API e non salva niente. Se serve un dato,
  si scrive a mano nell'HTML.
- Ogni schermata deve reggere da sola: chi la guarda deve capire cosa sta
  vedendo senza che nessuno gliela spieghi.
- Quando il prodotto cambia, cambia prima il prototipo. È l'unico posto dove
  cambiare idea non costa niente.

Il prototipo si costruisce nel Modulo 2, prima della descrizione del prodotto
e prima del database. Da quel momento resta nel repo come riferimento: è a lui
che si torna quando non si ricorda più cosa doveva fare una schermata.

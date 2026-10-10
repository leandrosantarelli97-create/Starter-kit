# Product Spec

Qui vivono le Product Spec: la descrizione di cosa fa il prodotto, feature
per feature. Sono la fonte di verità del prodotto in questo momento — quando
prodotto e spec non coincidono, si aggiorna prima la spec, poi il codice.

## `prodotto.md`

È l'unico file di questa cartella che non parla di una feature: descrive il
prodotto intero — cos'è, per chi, cosa sa fare. Nasce dal prototipo, prima del
database, ed è la base da cui tutto il resto si deriva: lo schema del database,
le spec delle singole feature, le decisioni di prodotto che arriveranno dopo.

## Come nasce una spec

Con la skill `crea-spec`: parti da un requisito anche di una riga ("voglio
salvare i contenuti in bozza"), la skill legge le spec esistenti e ti fa solo
le domande di prodotto a cui manca una risposta. Il risultato è un file
markdown in questa cartella.

## Regole

- Una spec per feature, piccola: se copre troppe cose, va spezzata. L'unica
  eccezione è `prodotto.md`, che per mestiere le copre tutte.
- Le spec parlano di prodotto (chi può fare cosa, regole, casi limite),
  non di dettagli tecnici.
- Il coding agent implementa la spec intera e non inventa decisioni di
  prodotto mancanti: se manca qualcosa, si torna alla spec.

La prima spec la scriverai nel Modulo 2 del corso, quando l'app inizierà a
salvare dati veri.

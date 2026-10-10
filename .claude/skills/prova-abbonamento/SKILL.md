---
name: prova-abbonamento
description: |
  Guida lo studente a provare i comportamenti dell'abbonamento che non si
  raggiungono cliccando: il rinnovo rifiutato, il termine per rimediare, il
  pagamento che rientra, la disdetta a pagamento sospeso, la chiusura che
  riporta al piano gratuito. Usala quando dice che vuole provare i pagamenti,
  il rinnovo, la disdetta o il webhook, quando ha appena implementato i piani
  e non sa come verificarli, o quando chiede come si fa a far passare un mese.
  NON usarla per: il primo acquisto con la carta di prova, che si fa cliccando;
  configurare Stripe la prima volta; scrivere o correggere codice.
---

# prova-abbonamento

Conduci lo studente attraverso cinque scenari dell'abbonamento. Sono i casi che
il codice gestisce e che nessuno ha mai visto succedere: si raggiungono solo
facendo passare il tempo e facendo fallire un pagamento, quindi finiscono in
produzione senza essere mai stati eseguiti nemmeno una volta.

**Tu non scrivi codice qui.** Se uno scenario si comporta male, lo descrivi a
parole e ti fermi: la correzione passa dal percorso normale, spec e poi
implementazione e poi review. E non nominare funzioni o file: chi ti legge non
legge codice, e ogni progetto ha un'implementazione diversa dalle altre.

**Le query però le scrivi tu**, perché servono a preparare il campo e chi ti
legge non conosce lo schema. Le tabelle e le colonne di questo progetto le
trovi nelle migration: leggile prima di scrivere la prima query, non tirare a
indovinare sui nomi. Qui sotto i valori da scrivere sono descritti a parole, e
tocca a te tradurli nelle colonne che esistono davvero.

---

## Come condurre la sessione

- **Uno scenario alla volta.** Prima dici che cosa deve succedere, poi dai le
  istruzioni, poi aspetti. Non anticipare quello dopo.
- **Non dare per buono «funziona».** Chiedi che cosa ha visto: quale evento,
  quale risposta, che cosa dice la pagina, quale data. Le tre cose vanno
  verificate tutte e tre, perché una schermata può sembrare giusta mentre sotto
  manca un pezzo.
- **Quando un evento non risponde 200**, chiedi il terminale del server di
  sviluppo, e solo la riga dell'errore con quelle immediatamente sotto. Il
  resto è rumore.
- **Alla fine fai il riepilogo**: quali scenari sono passati, quali no, e che
  cosa resta da decidere.

## Prima di cominciare

Servono due terminali aperti dentro il progetto.

Nel primo:

```
npm run dev
```

Nel secondo:

```
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Il secondo stampa un segreto che comincia con `whsec_`. **Cambia a ogni sessione
di `listen`**: se quello nel file delle variabili d'ambiente è diverso, va
aggiornato e il server di sviluppo va riavviato. Con il segreto vecchio ogni
evento risponde 400 e non succede niente.

Spiega come si legge il terminale del `listen`, perché è lì che si guarda per
tutta la sessione. Ogni evento stampa due righe: la prima è quello che Stripe
manda, la seconda è la risposta dell'applicazione. Conta la seconda. 200 vuol
dire gestito, 400 è il segreto sbagliato, 500 è il codice che si è rotto, e in
quel caso l'errore vero sta nell'altro terminale.

## Scenario 1: l'abbonamento si chiude e l'account torna al piano gratuito

Si prova subito, senza preparare niente, e serve ad avere il terminale funzionante
prima degli scenari difficili.

Serve un account con l'abbonamento a pagamento attivo. Dal dashboard di Stripe,
in modalità test: Clienti, il cliente, il suo abbonamento, e lo si annulla
scegliendo di farlo subito.

Deve succedere questo: l'evento della chiusura risponde 200, e la pagina del
piano torna a dire che l'account è sul piano gratuito. Il piano non lo cambia
mai il browser, lo cambia la conferma che arriva da Stripe.

## La preparazione degli altri quattro

Gli scenari da 2 a 5 stanno tutti dietro un rinnovo, cioè dietro un mese di
calendario. Si arriva lì con una **simulazione**, che è un orologio finto da far
avanzare a comando. Nel dashboard sta in Billing, dentro Abbonamenti, alla voce
Simulazioni.

1. Crea la simulazione, con l'ora di partenza di adesso.
2. **Crea il cliente dentro la simulazione**, con la stessa email dell'account
   con cui entri nell'applicazione. Un cliente che esiste già non si può
   spostare dentro una simulazione: è per questo che ne serve uno nuovo.
3. Scrivi quel cliente sul profilo dell'account, nel SQL Editor di Supabase.
   L'applicazione riusa il cliente che trova sul profilo e ne crea uno nuovo solo
   se non ce n'è: così il pagamento nasce già dentro l'orologio finto.

   Prima però guarda com'è messo l'account adesso: se una partita precedente ha
   lasciato uno stato a metà, lo scenario che stai per provare parte da un punto
   che non è quello che credi. Le email stanno in `auth.users`, lo stato
   dell'abbonamento sul profilo: unisci le due tabelle e mostragli la riga.

   Poi scrivi il cliente nuovo sul profilo e **azzera nella stessa query tutto
   il resto dello stato dell'abbonamento**: l'abbonamento vecchio, lo stato, la
   fine del periodo, la data del rifiuto, l'eventuale disdetta definitiva. Il
   piano compreso: se resta quello a pagamento, l'applicazione non ti fa
   ricomprare niente e la partita non parte nemmeno.

4. Compra il piano a pagamento dall'applicazione, con la carta `4242 4242 4242
   4242`. Qui deve andare tutto liscio.
5. Metti una carta che fallirà al rinnovo. Se l'applicazione permette di
   cambiare il metodo di pagamento, fallo da lì. Altrimenti dal terminale:

   ```
   stripe payment_methods attach pm_card_chargeCustomerFail --customer cus_...
   stripe subscriptions update sub_... -d default_payment_method=pm_...
   ```

   Quella carta si registra senza problemi e rifiuta ogni addebito successivo.

Se il punto 5 si è dovuto fare dal terminale, **è già un risultato**: vuol dire
che chi ha l'abbonamento in regola non ha modo di aggiornare la propria carta
prima che il rinnovo fallisca. Dillo, e vedi con lui se è quello che vuole.

## Scenario 2: il rinnovo viene rifiutato

Fai avanzare la simulazione al giorno dopo la scadenza del periodo pagato. Stripe
emette la fattura del rinnovo, tenta l'addebito e viene rifiutato.

Deve succedere questo: arriva l'evento del pagamento fallito, e la pagina avvisa
che il rinnovo non è riuscito dicendo **entro quando** si può rimediare e da
quando l'account torna al piano gratuito.

**Guarda la data, non solo il messaggio.** Qui c'è la trappola più insidiosa
della simulazione: l'orologio finto vale per l'abbonamento, non per gli eventi,
che nascono con l'ora vera. La data del rifiuto sarà quella di oggi, mentre
l'abbonamento è un mese avanti, e il termine risulterà scaduto in partenza.

Per vedere il termine come lo vede un utente vero, sposta a mano la data del
rifiuto registrata sul profilo, portandola al giorno in cui si trova la
simulazione.

Poi fai ripassare il codice dalla stessa porta con una modifica innocua
all'abbonamento, che genera un evento senza cambiare niente di sostanziale:

```
stripe subscriptions update sub_... -d description="ping"
```

## Scenario 3: il pagamento rientra

Si parte dallo stato dello scenario 2. Metti una carta buona e paga la fattura
rimasta aperta, dall'applicazione se si può, altrimenti dal dashboard.

Deve succedere questo: la fine programmata sparisce, l'avviso del rinnovo
fallito sparisce con lei, e la pagina torna a dire quando avverrà il prossimo
rinnovo. Verifica anche che sia sparita la data del rifiuto: se resta, il
prossimo problema conterà i giorni da una data vecchia.

## Scenario 4: il termine scade e nessuno rimedia

Si parte dallo stato dello scenario 2. Fai avanzare la simulazione oltre il
termine comunicato all'utente.

Deve succedere questo: Stripe chiude l'abbonamento, l'account torna al piano
gratuito, e i contenuti già creati restano tutti al loro posto.

## Scenario 5: la disdetta mentre il pagamento è sospeso

Si parte dallo stato dello scenario 2. Disdici dall'applicazione, con il rinnovo
già rifiutato.

Deve succedere questo: la fine resta il termine già comunicato, e non la fine di
un periodo che nessuno ha pagato. La fattura aperta viene annullata, altrimenti
Stripe continua a ritentare l'addebito e un tentativo riuscito dopo la disdetta
sarebbe un mese pagato e mai usato. E quella disdetta non si deve poter
annullare, perché non c'è più nessuna fattura da incassare.

**Gli scenari 3, 4 e 5 partono tutti dallo stesso punto e si escludono a
vicenda.** Dopo il rifiuto sono tre strade alternative: per provarle tutte
servono tre partite, ognuna con un cliente nuovo dentro la simulazione. Dillo
prima, non dopo, così sceglie da quale cominciare.

## Le trappole della simulazione

Vanno dette quando capitano, non tutte all'inizio.

- **La data degli eventi resta quella vera.** L'orologio finto sposta
  l'abbonamento, non gli eventi. È la trappola dello scenario 2.
- **Mentre l'orologio avanza, Stripe blocca le scritture** su tutto ciò che sta
  dentro la simulazione, e intanto consegna gli eventi. Un errore che parla di
  avanzamento in corso non è un difetto dell'applicazione: rispondere 500 lì è
  la cosa giusta, perché fa riprovare Stripe più tardi. Aspetta che l'orologio
  sia fermo e rimanda l'evento con il `ping`.
- **Il `listen` non riconsegna niente da solo.** Se un evento è fallito, non
  torna: si fa ripassare il codice con il `ping`.
- **Un cliente esistente non entra in una simulazione.** Ogni partita vuole il
  suo cliente nuovo.

## Quando qualcosa non torna

Non concludere «è un bug» dal solo terminale. Prima distingui tre cose:

1. **Un limite della simulazione**, come i due primi punti qui sopra. Non è un
   difetto e non si corregge.
2. **Una decisione di prodotto che manca.** Il codice si comporta in un modo che
   nessuno ha mai deciso, perché la descrizione del prodotto non dice niente su
   quel caso. Allora la cosa da scrivere non è codice: è la riga che manca.
3. **Un difetto vero**, cioè il codice fa una cosa diversa da quella dichiarata.

Per il secondo e il terzo caso scrivi tre frasi: che cosa succede, in quali
condizioni, e che conseguenza ha per chi usa l'applicazione o per chi la gestisce.
Poi fermati: da lì riparte il percorso normale.

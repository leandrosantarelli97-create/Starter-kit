# Decisioni di design

Le decisioni di design del progetto, prese una volta e valide per tutto: prima per il
prototipo che disegni nel Modulo 2, poi per il prodotto vero. I valori esatti vivono in
`assets/tailwind-config.js` e `assets/proto.css`, che trovi già qui: in questo file c'è
il perché, che nel codice non si legge.

È **autosufficiente**. I pattern vengono da una ricognizione su una libreria di
riferimenti a pagamento, ma sono scritti per esteso apposta: per ottenere questo design
non ti serve nessun abbonamento e non devi aprire nessun link. È anche il motivo per cui
questo file esiste — la ricognizione è già stata fatta, tu parti da qui.

Il coding agent lo legge prima di disegnare una schermata. Quando ti propone qualcosa che
contraddice una di queste regole, la regola vince.

Nome interno del linguaggio: **workspace sobrio, accento unico**.

---

## 1. Token

Sorgente autorevole: `assets/tailwind-config.js`. Riportati qui perché il file del
prototipo non sopravvive al passaggio a Next.js.

### Colori

| Token          | Hex       | A cosa serve                                        |
| -------------- | --------- | --------------------------------------------------- |
| `paper`        | `#FAF9F7` | sfondo dell'applicazione                            |
| `surface`      | `#FFFFFF` | card, barra laterale, campi                         |
| `ink`          | `#17161A` | testo principale, bottone primario                  |
| `ink-soft`     | `#5C5A62` | testo secondario                                    |
| `ink-faint`    | `#8F8C95` | metadati, placeholder, testo disattivato            |
| `line`         | `#E7E4DE` | bordi e divisori                                    |
| `line-strong`  | `#D5D1C9` | bordi dei campi, tratteggi                          |
| `accent`       | `#D9411E` | **vedi regola sotto**                               |
| `accent-ink`   | `#A32F10` | hover dell'accento, testo su fondo chiaro           |
| `accent-soft`  | `#FCEFEA` | fondo dei banner d'errore                           |
| `ok`           | `#1E8A50` | pubblicato, riuscito, variazione positiva           |
| `ok-soft`      | `#EAF5EE` | fondo dello stato riuscito                          |
| `warn`         | `#A9750F` | bozza, canale fermo, modifiche non salvate          |
| `warn-soft`    | `#FBF3E2` | fondo dell'avviso                                   |

Grigi extra usati inline e non tokenizzati: `#F2F0EB` (voce di menu attiva, hover),
`#EFECE7` (skeleton, contatore delle tab), `#E4E0D8` (barre del grafico, periodo passato).
Se li porti nel prodotto, tokenizzali.

### Tipografia

- **Instrument Sans** per tutto il testo. Variabile, pesi 400–700, `font-feature-settings: 'ss01'`.
- **JetBrains Mono** (400/500) per numeri, etichette, metadati, date, contatori.

La regola vera è questa: **se è un numero o un'etichetta di sistema, è mono**. Serve a
distinguere a colpo d'occhio ciò che il prodotto misura da ciò che l'utente ha scritto.
La classe `.label` (10px, `letter-spacing .09em`, maiuscolo, `ink-faint`) è il cavallo di
battaglia di tutta l'interfaccia.

Niente Inter, niente Roboto, niente font di sistema: sono la firma visiva del "generato da
un'AI" e questo prodotto vuole sembrare disegnato.

### Geometria e profondità

- Raggio: **6px** di default, 8px (`lg`) per le card piccole, 12px (`xl`) per le sezioni.
- Ombre quasi assenti: `card` = `0 1px 2px rgba(23,22,26,.05)`. `pop` (`0 16px 40px -12px
  rgba(23,22,26,.22)`) **solo** per ciò che sta sopra la pagina: modali, barra di
  salvataggio, screenshot nella landing.
- La gerarchia la fanno **bordi e spazio**, non le ombre.
- Transizioni: `.14s ease`. Comparsa in pagina: `.5s cubic-bezier(.22,1,.36,1)` con
  ritardi scalati di 40–60ms (classe `.reveal`).

---

## 2. Le cinque regole non negoziabili

### 2.1 L'accento non è decorativo

`#D9411E` compare **solo** in quattro punti:

1. la voce di menu attiva (barretta da 2px a sinistra),
2. il consumo del piano,
3. l'azione di generazione (l'unico `btn-accent` di ogni schermata),
4. gli errori.

Ogni altro uso lo indebolisce. Se serve un colore in più, la risposta quasi sempre è che
serve più spazio bianco. Corollario: **al massimo un `btn-accent` per schermata**.

### 2.2 Il colore dice sempre la stessa cosa

`ok` = riuscito o pubblicato. `warn` = in sospeso o fermo. `accent` = azione o errore.
Mai usarli per decorare o per distinguere categorie.

### 2.3 Icone solo se identificano

Un'icona è ammessa quando identifica **qualcosa di esterno** (il marchio di un canale) o
**uno stato** (la freccia della variazione, il pallino di bozza/pubblicato). Titoli di
sezione, KPI e bottoni non hanno icone.

I marchi dei canali sono quelli **ufficiali** (Simple Icons, CC0; la busta della newsletter
viene da Heroicons), tenuti **monocromatici in `currentColor`**. Motivo: il blu LinkedIn
accanto al rosa Instagram ruba il ruolo all'accento. La forma del marchio basta a farlo
riconoscere. Vivono in `CANALI` dentro `proto.js`.

Nelle liste, canale e stato stanno in **colonne di larghezza fissa** (`w-24`), altrimenti
l'occhio non può scendere in verticale e le icone non servono a niente.

### 2.4 Non si mostrano numeri che il prodotto non possiede

La Panoramica misura contenuti pubblicati, canali, costanza. **Non** like, impression o
commenti: richiederebbero le API di LinkedIn e Instagram. Un grafico di dati che non
possiedi è una bugia a schermo.

Le stime dichiarate come tali (le "ore risparmiate") sono ammesse, ma la riga sotto deve
dire su cosa sono calcolate.

### 2.5 Ogni schermata mostra la stessa storia

Se la schermata dice "quota esaurita", il contatore nella barra laterale deve dire 50/50.
Nel prototipo lo fa una funzione sola, che aggiorna tutti i punti in cui quel numero
compare; nel prodotto vero è la stessa sorgente dati. Tre rappresentazioni scollegate
dello stesso fatto sono il modo più rapido per mostrare in video un'incoerenza.

---

## 3. Componenti

Definiti in `assets/proto.css` in CSS puro (niente `@apply`: la CDN di Tailwind non
processa un foglio esterno). Nel prodotto vero diventano componenti React; i valori
restano questi.

| Classe                      | Note                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| `.label`                    | mono 10px maiuscolo, `ink-faint` — l'elemento più usato              |
| `.btn` + `-primary/-secondary/-accent/-ghost` | altezza 36px, `-sm` 30px, raggio 6px          |
| `.field` / `.field-error`   | focus = bordo `ink` + alone `rgba(23,22,26,.07)`                     |
| `.chip`                     | pillola; `aria-pressed="true"` inverte su `ink`                      |
| `.tab` / `.tab-count`       | sottolineatura accento su `aria-selected`                            |
| `.nav-item`                 | attivo = fondo `#F2F0EB` + barretta accento 2px in `::before`        |
| `.reveal`                   | comparsa scalata al caricamento                                      |
| `.skeleton`                 | shimmer per gli stati di caricamento                                 |
| `.caret`                    | cursore lampeggiante mentre l'AI scrive                              |

Lo stato è portato da attributi ARIA (`aria-pressed`, `aria-selected`, `aria-current`),
non da classi `.is-active`. Nel prodotto vero **mantieni questa scelta**: l'accessibilità
arriva gratis e lo stile segue lo stato reale.

---

## 4. I pattern, schermata per schermata

Nessuno di questi layout è copiato riga per riga: si prende il principio e si cambia
palette, tipografia e impaginazione.

### Il brand attivo, in cima alla barra laterale

- Un account può avere più brand ma ne usa **uno alla volta**, e da quello dipende tutto
  ciò che si vede. Un contesto del genere sta nella barra laterale, sotto il logo e sopra
  le voci di menu: la stessa colonna che dice già chi sei e su che piano sei. Nella
  testata di ogni pagina sarebbe letto come un'azione della pagina, mentre cambiare brand
  cambia l'intera applicazione.
- Il selettore **mostra il nome per esteso**, non solo l'iniziale: se per sapere dove ti
  trovi devi aprirlo, prima o poi scriverai il post giusto per il brand sbagliato. Con un
  brand solo non compare affatto — un menu con una voce è rumore.
- Il brand bloccato da un downgrade **resta nell'elenco**, segnato da un'etichetta mono:
  toglierlo equivarrebbe, per chi guarda, ad averlo perso. Sceglierlo non cambia niente e
  apre l'invito a passare a Pro, che dice anche che i contenuti sono al loro posto.
  L'elenco resta aperto, perché chiudersi è il gesto che l'interfaccia fa quando una
  scelta è andata a buon fine.
- L'invito usa il fondo `warn`, non l'accento: un brand bloccato è **fermo**, non un
  errore. E il brand attivo si distingue con lo stesso fondo delle voci di menu attive,
  senza la barretta accento: l'accento resta ai suoi quattro posti.
- Un brand nuovo si crea **da dentro il selettore**, in fondo all'elenco: si aggiunge un
  brand nello stesso posto in cui si vede quanti se ne hanno, e non serve una schermata
  che esista solo per quello. Al tetto del piano l'azione **non sparisce e non si
  disabilita**: apre lo stesso invito dei brand bloccati e dice quanti brand include il
  piano. Un limite di cui non puoi toccare il bordo non si impara mai, e un'azione
  disabilitata senza spiegazione si legge come un guasto.
- Ogni schermata che **modifica** un brand ne dichiara il nome accanto al titolo, con un
  divisore sottile e niente di più. Il selettore serve a cambiare brand, non a ricordarti
  su quale stai scrivendo: un modulo senza soggetto è il modo più rapido per riscrivere
  l'identità sbagliata. Il nome c'è anche con un brand solo — è il soggetto della pagina,
  non un menu, quindi non compare e sparisce con l'elenco.

### Lista contenuti

- **Tab di stato con contatore**, non un menu a tendina di filtri: `Tutti`, `Bozze 5`,
  `Pubblicati 2`. Il numero sta in una pillola mono su fondo `#EFECE7`. La tab selezionata
  ha una sottolineatura accento da 2px.
- Ricerca e filtro **sulla stessa riga delle tab**, allineati a destra.
- **Un solo bottone primario** in alto a destra nell'intestazione della pagina.
- Ogni riga: titolo + una riga sola di estratto a sinistra (`line-clamp-1`), poi tre
  **colonne di larghezza fissa** a destra — canale, stato, data. Fisse, altrimenti l'occhio
  non scende in verticale.
- Il titolo mancante si scrive *Senza titolo* in corsivo e `ink-faint`: è un dato assente,
  non un titolo.

### Editor di generazione

- **Pannello dei parametri a sinistra (352px), risultato a destra.** I parametri sono
  campi separati e visibili (canale, argomento, tono, lunghezza), non un prompt libero.
- L'azione di generazione è **appiccicata in fondo al pannello** e cambia forma a seconda
  dello stato: pronta / in corso disabilitata con spinner / bloccata con banner di quota.
- Sopra il testo generato, una **striscia di riepilogo dei parametri usati**
  (`LINKEDIN · DIRETTO, CONCRETO · MEDIO · GENERATO 2 MIN FA`) più un `Rigenera`. Serve a
  rendere il risultato ripetibile: sai cosa cambiare per riprovare.
- L'output è un **foglio di testo pulito**, non una bolla di chat. Textarea senza bordi,
  con il badge `Bozza` accanto al titolo del documento.
- L'intestazione del documento **c'è sempre**, in ogni stato. Cambiano i controlli dentro,
  non la sua esistenza: altrimenti la pagina "salta" passando da uno stato all'altro.

### Brand e tono di voce

- Il tono di voce si sceglie con **chip selezionabili**, non con un campo libero.
- Accanto, **un'anteprima dal vivo** che si aggiorna a ogni selezione, impaginata come un
  post della piattaforma di destinazione. È il modo più rapido per capire cosa cambia senza
  consumare una generazione. Nel prototipo è sticky sulla colonna di destra.
- **Identità** (cosa fate, a chi) e **linguaggio** (come parlate) stanno in card separate.
- Le textarea lunghe hanno sempre un **contatore di caratteri** allineato a destra
  dell'etichetta.
- La barra "modifiche non salvate" compare **alla prima modifica**, non è sempre presente.

### Piano e limiti d'uso

- **Un limite per riga, ognuno con la sua barra**: generazioni, brand, contenuti archiviati.
  Non un unico numero riassuntivo.
- Accanto al consumo, sempre **la data di rinnovo** e quanto ne resta scritto a parole
  ("te ne restano 38 questo mese").
- L'invito all'upgrade è un **banner dentro la pagina**, non un popup che interrompe.
- Le card di confronto piano sono `flex flex-col` con il bottone in `mt-auto`, così restano
  della stessa altezza anche con un numero diverso di voci.

### Panoramica

- **Riga di KPI con la variazione** sopra il grafico: numero grande in mono, sotto una riga
  di contesto colorata (`ok` se migliora, `warn` se qualcosa è fermo).
- Il grafico misura la **costanza**, non l'engagement. Barre settimanali, periodo passato in
  `#E4E0D8`, mese corrente in `ink`, settimana in corso tratteggiata in `accent`.
- **Linea tratteggiata orizzontale** che dà un metro al grafico. Qui è la media dell'utente
  stesso, calcolata sulle settimane a schermo. Nel prodotto la linea va posizionata in pixel
  sul valore reale, non a percentuale a occhio.
- **Card di confronto** accanto al grafico: dice come sta andando la settimana in corso
  rispetto al ritmo abituale, **prima che la settimana finisca**, e chiude con l'azione. È
  l'elemento che trasforma la dashboard da specchietto retrovisore a suggerimento.
- Lo streak si scrive **asciutto, in mono** ("8 settimane di fila"). Niente fiammelle,
  medaglie, coppe, coriandoli o badge: sono linguaggio consumer, e chi pubblica per lavoro
  li legge come paternalismo. Quando serve segnalare un esito riuscito, bastano un segno di
  spunta e il colore `ok`.

### Landing

- **Headline breve + screenshot di prodotto a tutta larghezza** subito sotto. Nel prototipo
  lo screenshot è HTML vero dentro una cornice di browser, non un'immagine: resta nitido e
  si aggiorna quando cambia il design.
- **Fascia di numeri** con barretta verticale a sinistra di ciascuno: numero grande in mono,
  una riga di spiegazione, e sotto **l'attribuzione a un cliente**. Un numero senza
  attribuzione non regge.
- Le card dei benefici hanno una **micro-etichetta mono sopra il titolo** (`PIÙ RICHIESTE`,
  `AUTOREVOLEZZA`): fa capire quale beneficio stai leggendo prima ancora di leggerlo.
- Le card si titolano **con l'esito, non con la funzionalità** ("Ti chiamano perché ti hanno
  già letto", non "Generazione AI del testo"). Sotto il titolo si spiega il **meccanismo**,
  altrimenti resta una promessa vuota.

<details>
<summary>Riferimenti originali (servono solo a chi ha un account Mobbin)</summary>

Editor: OpenAI Platform, Semrush, Mistral, Fireflies, Magnific, SchoolAI ·
Lista: Substack, Hashnode, Framer, Featurebase, Amplitude ·
Icone dei canali: Buffer, Later, Sprout Social, Hootsuite ·
Brand: Squarespace, Bloom, Jasper, Customer.io, Shopify ·
Piano: Base44, Glide, Google Gemini, Fabric, Gamma ·
Panoramica: Semrush Social, Ghost, Substack, Kit, Codecademy, Linktree, Gusto ·
Scartati di proposito: Duolingo, YNAB, Preply, Quicken, Superhuman ·
Landing: Stripe, Customer.io, Jasper, Maze, Titan Intake, Apollo, Grammarly, Intercom, Copy.ai, Craft

</details>

---

## 5. Il comportamento su mobile

Il design è **pensato per il desktop**: si scrive un post da mille caratteri seduti a una
scrivania, non col pollice. Ma la landing riceve traffico da LinkedIn e Instagram, cioè da
telefono, e chi entra nell'app dal telefono deve almeno poter rileggere una bozza e
approvarla. Quindi: **landing e accesso pienamente responsive, app leggibile e navigabile
ma non ridisegnata.**

Non ci sono nuovi token e non ci sono nuove decisioni estetiche. Il mobile qui è
**aritmetica sui token che già esistono**, e si ottiene con quattro trasformazioni.

**Un solo punto di rottura: `lg` (1024px).** La barra laterale occupa 248px; sotto i 1024
non restano abbastanza pixel per una colonna di contenuto sensata. Dove serve una
sfumatura in più si usa `sm` (640px), che è la soglia oltre la quale una riga a più colonne
torna leggibile. Non servono altri breakpoint: aggiungerne significa avere quattro layout
da tenere allineati invece di due.

### 5.1 La barra laterale diventa un pannello a scomparsa

Sotto `lg` esce dal flusso (`fixed inset-y-0 left-0 z-40 -translate-x-full`) e rientra
quando si apre. Sopra `lg` torna `static` e la trasformazione si annulla.

Non è una seconda navigazione: è **la stessa, spostata**. Le voci, l'ordine, la card del
piano e l'utente in fondo restano identici — altrimenti diventano due mappe mentali diverse
dello stesso prodotto. Sotto c'è un velo (`bg-ink/25`, `z-30`) che chiude al tocco.

Il pulsante che la apre non vive nelle pagine: viene inserito da `proto.js` come primo
elemento dell'intestazione che ogni schermata ha già. Così le schermate non devono sapere
niente del mobile, e aggiungerne una nuova non richiede di ricordarsi l'hamburger.

### 5.2 I margini si stringono, non le proporzioni

`px-8` diventa `px-5 lg:px-8`. Sono 24px recuperati su 390, che su una card è la differenza
tra un testo che respira e uno che va a capo ogni tre parole. Tutto il resto — raggi,
spessori dei bordi, dimensioni del testo — **non cambia**: rimpicciolire il testo su mobile
è il modo più veloce per rendere illeggibile un'interfaccia già piccola.

### 5.3 Le griglie collassano su una regola sola

Quattro colonne diventano due, non una: due KPI affiancati si confrontano ancora a colpo
d'occhio, uno sotto l'altro diventano un elenco. Le griglie asimmetriche (contenuto +
colonna laterale) vanno invece **a colonna piena**, perché una colonna da 340px schiacciata
a 150 non è più una colonna, è un rettangolo.

| Dove | Desktop | Sotto il breakpoint |
| ---- | ------- | ------------------- |
| KPI della Panoramica | `grid-cols-4` | `grid-cols-2` fino a `lg` |
| Panoramica: grafico + card | `grid-cols-[1fr_340px]` | una colonna fino a `lg` |
| Copertura dei canali | `grid-cols-[120px_1fr_44px]` | `grid-cols-[104px_1fr_36px]` fino a `sm` |
| Brand: campi + anteprima | `grid-cols-[1fr_320px]` | una colonna fino a `lg` |
| Piano: dettagli | `grid-cols-2` | una colonna fino a `sm` |

### 5.4 Le righe della lista si impilano

È l'unico punto in cui il layout cambia davvero forma. Sul desktop la riga è
titolo+estratto a sinistra e tre colonne allineate a destra (canale · stato · data). Sotto
`sm` i metadati **scendono sotto il titolo** su una riga sola, le larghezze fisse `w-24`
cadono e la data va a destra con `ml-auto`.

Il marchio del canale qui smette di essere un ornamento e diventa la cosa che permette di
scandire la lista senza leggere: è la ragione per cui l'icona precede sempre il nome.

### 5.5 L'editor: due colonne che diventano una pagina sola

`main` passa da `flex` a `flex-col lg:flex-row`: prima i parametri, poi il pulsante di
generazione, poi il risultato. **Non è un flusso a due passi con avanti e indietro**, ed è
una scelta: tenendo tutto sulla stessa pagina l'utente vede sempre con quali impostazioni è
stato generato quel testo, e per correggerle scorre invece di tornare indietro.

Lo scorrimento si sposta di conseguenza: sul desktop scorrono i due pannelli
separatamente, sotto `lg` scorre `main` come una pagina unica (`overflow-y-auto
lg:overflow-visible`, e gli `overflow-y-auto` interni diventano `lg:overflow-y-auto`).

### 5.6 Due dettagli che si dimenticano sempre

**L'altezza.** `h-screen` diventa `h-[100dvh]`. Su mobile `100vh` è più alto della porzione
visibile, quindi con `overflow-hidden` sul body il fondo della schermata finisce sotto la
barra del browser. `dvh` segue la barra mentre compare e scompare.

**Il copy che descrive il layout.** «L'anteprima *a fianco* si aggiorna» smette di essere
vera quando la colonna scende sotto. I testi dell'interfaccia non devono nominare la
posizione degli elementi, perché la posizione cambia con la larghezza.

### 5.7 Cosa si può nascondere, e cosa no

Si nasconde ciò che è **ridondante** a quella larghezza: nel finto screenshot della landing
la card "Questa settimana" sparisce sotto `sm`, perché il suo messaggio è già nel titolo
sopra e a 12px sarebbe illeggibile. Nell'editor sparisce il badge "Bozza", perché lo stesso
stato è scritto nella lista da cui si arriva.

Non si nasconde mai un'**azione** né un dato che esiste solo lì. Se una cosa sta solo sul
desktop, sul telefono quella cosa non si può fare — ed è un buco nel prodotto, non una
scelta di layout.

---

## 6. Portarlo in Next.js

1. **I token vanno in `app/globals.css`, non in un file di configurazione.** Il prodotto usa
   Tailwind 4, dove il tema si dichiara in CSS dentro `@theme`: un `tailwind.config.ts` non
   verrebbe letto. `assets/tailwind-config.js` serve solo al prototipo, che carica Tailwind
   dalla CDN. I valori si copiano identici, il posto in cui si scrivono è diverso.
2. Le variabili CSS di `proto.css` (`:root`) vanno nello stesso file. **Aggiungi `--ok` e
   `--warn`**, che nel prototipo esistono solo lato Tailwind.
3. **La palette che trovi già in `globals.css` è un segnaposto** del Modulo 1: va
   sostituita, non affiancata. Due palette che convivono sono il modo più rapido per avere
   due arancioni quasi uguali e non sapere quale usare.
4. I font: da `@import` di Google Fonts a `next/font/google`. Servono **Instrument Sans e
   JetBrains Mono**: se nel layout c'è un font display avanzato dal Modulo 1, esce di scena
   qui, perché in questo linguaggio la seconda voce tipografica è il mono.
5. `.btn`, `.field`, `.chip`, `.tab`, `.nav-item`, `.label` → componenti React. I valori
   restano quelli della tabella sopra.
6. `proto.js` **non si porta**: barra degli stati, iniezione della barra laterale e
   micro-interazioni finte esistono solo per il prototipo. Da salvare: la mappa `CANALI`
   con i marchi ufficiali, e le classi del pannello a scomparsa della sezione 5.1 — lì il
   pulsante non sarà più iniettato via JS, starà nel componente del layout.

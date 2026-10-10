// Questa è la homepage: la prima pagina che vedi quando avvii l'app.
// Nel Modulo 1 del corso farai qui la tua prima modifica.

// Cambia questo valore con il tuo nome: è la tua prima modifica al codice.
const NOME_STUDENTE = "il tuo nome";

// Le tappe del percorso. Ogni oggetto tra { } è una milestone:
// prova a cambiare un testo, salva il file e guarda il browser aggiornarsi.
const MILESTONES = [
  {
    codice: "M1",
    titolo: "La tua prima app online",
    descrizione:
      "Starter kit avviato in locale, prima modifica e deploy su Vercel.",
    nota: "ci sei quasi",
  },
  {
    codice: "M2",
    titolo: "App con dati veri",
    descrizione:
      "Database Supabase, dati salvati per davvero, account utente.",
    nota: null,
  },
  {
    codice: "M3",
    titolo: "App con AI",
    descrizione:
      "Generazione di testo con AI: prima con il mock, poi con OpenAI.",
    nota: null,
  },
  {
    codice: "M4",
    titolo: "SaaS completo",
    descrizione: "Piani Free e Pro con Stripe, limiti d'uso, email.",
    nota: "binario SaaS",
  },
  {
    codice: "M5",
    titolo: "Go live",
    descrizione:
      "Ambiente di produzione, security checklist, la tua app pubblica.",
    nota: null,
  },
];

export default function Home() {
  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-14 sm:py-20">
      {/* Intestazione */}
      <header className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-5">
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          Vibe Coding
        </p>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          starter kit
        </p>
      </header>

      {/* Hero */}
      <section className="pt-14 sm:pt-20 pb-16">
        <h1 className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl font-semibold leading-[1.05] tracking-tight text-balance">
          Se stai leggendo questa pagina,{" "}
          <em className="text-accent">funziona tutto.</em>
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft">
          Questa è la base dell'app che costruirai durante il corso. Adesso è
          quasi vuota — e va bene così: quale app diventerà lo decidi tu. La
          riempirai una milestone alla volta.
        </p>
      </section>

      {/* Le tappe del percorso */}
      <section aria-labelledby="percorso">
        <h2
          id="percorso"
          className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-6"
        >
          Il percorso
        </h2>
        <ol className="border-t border-line">
          {MILESTONES.map((milestone) => (
            <li
              key={milestone.codice}
              className="group flex gap-5 sm:gap-8 items-baseline border-b border-line py-5 px-2 -mx-2 transition-colors hover:bg-card"
            >
              <span className="font-[family-name:var(--font-display)] text-2xl font-semibold text-accent w-12 shrink-0">
                {milestone.codice}
              </span>
              <div className="flex-1">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-medium tracking-tight">
                  {milestone.titolo}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {milestone.descrizione}
                </p>
              </div>
              {milestone.nota && (
                <span className="hidden sm:inline-block shrink-0 text-[11px] uppercase tracking-[0.15em] text-paper bg-ink rounded-full px-3 py-1">
                  {milestone.nota}
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Firma */}
      <footer className="pt-14 pb-4">
        <p className="text-sm text-ink-soft">
          In costruzione da{" "}
          <span className="font-medium text-ink border-b-2 border-accent">
            {NOME_STUDENTE}
          </span>{" "}
          — corso Vibe Coding di AI Builders Italia.
        </p>
      </footer>
    </main>
  );
}

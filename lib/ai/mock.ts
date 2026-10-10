import type { GenerateTextInput } from "./index";

// Provider finto: restituisce risposte predefinite senza chiamare nessuna
// API. Serve per costruire e provare tutta l'app senza API key e senza
// spendere nulla. Si attiva con AI_PROVIDER=mock (è il default).

const MOCK_RESPONSES = [
  `Questo testo non arriva da nessuna intelligenza artificiale: è una
risposta finta, scritta a mano dentro il file lib/ai/mock.ts.

Serve a farti costruire tutta l'interfaccia — il pulsante, l'attesa, il
risultato che compare — senza API key e senza spendere un centesimo.

Quando nel Modulo 3 imposterai AI_PROVIDER=openai, al posto di questo testo
comparirà una risposta vera. Il resto dell'app non cambierà di una riga: è
questo il senso di avere un unico punto di ingresso per l'AI.`,
  `Risposta finta numero due.

Le risposte disponibili sono tre e vengono scelte in base alla lunghezza
della richiesta: la stessa richiesta produce sempre lo stesso testo. È una
scelta voluta — così puoi provare l'app e sapere in anticipo cosa aspettarti.

Se ti serve una risposta diversa mentre costruisci, aggiungine una a
MOCK_RESPONSES: è una lista di testi come questo, niente di più.`,
  `Risposta finta numero tre.

Prima di comparire, questo testo ha aspettato circa un secondo. Anche quello
è finto: serve a simulare il tempo che impiega una vera chiamata AI, così
mentre costruisci vedi davvero gli stati di caricamento invece di trovarti
il risultato già lì.

Un'interfaccia che sembra istantanea in sviluppo e lenta in produzione è uno
dei modi più comuni di accorgersi troppo tardi di un problema.`,
] as const;

export async function generateWithMock(
  input: GenerateTextInput
): Promise<string> {
  // Piccola attesa per simulare la latenza di una vera chiamata AI:
  // così l'interfaccia mostra gli stati di caricamento in modo realistico.
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // La risposta è scelta in base alla lunghezza del prompt: stessa richiesta,
  // stessa risposta. Prevedibile, quindi facile da testare.
  const index = input.prompt.length % MOCK_RESPONSES.length;
  return MOCK_RESPONSES[index];
}

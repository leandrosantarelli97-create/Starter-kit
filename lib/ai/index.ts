import "server-only";

import { generateWithMock } from "./mock";
import { generateWithOpenAI } from "./openai";

// Unico punto di ingresso per la generazione di testo con AI.
// Il provider si sceglie con la variabile d'ambiente AI_PROVIDER:
//   - "mock" (default): risposte finte predefinite, nessuna API key richiesta
//   - "openai": chiama davvero OpenAI (serve OPENAI_API_KEY, Modulo 3)
//
// L'import di "server-only" qui sopra fa fallire la build se questo file
// viene importato da codice che gira nel browser: le chiamate AI (e le
// API key) devono restare solo sul server.

export type GenerateTextInput = {
  // Istruzioni di sistema: chi è l'assistente e come deve comportarsi
  system?: string;
  // La richiesta vera e propria dell'utente
  prompt: string;
};

export async function generateText(input: GenerateTextInput): Promise<string> {
  const provider = process.env.AI_PROVIDER ?? "mock";

  switch (provider) {
    case "mock":
      return generateWithMock(input);
    case "openai":
      return generateWithOpenAI(input);
    default:
      throw new Error(
        `AI_PROVIDER "${provider}" non riconosciuto. Valori validi: "mock", "openai".`
      );
  }
}

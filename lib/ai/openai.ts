import OpenAI from "openai";

import type { GenerateTextInput } from "./index";

// Provider reale: chiama l'API di OpenAI. Si attiva con AI_PROVIDER=openai
// e richiede OPENAI_API_KEY in .env.local (Modulo 3 del corso, dopo aver
// attivato il billing con un limite di spesa).

const DEFAULT_MODEL = "gpt-5-mini";

export async function generateWithOpenAI(
  input: GenerateTextInput
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "AI_PROVIDER è impostato su \"openai\" ma manca OPENAI_API_KEY in " +
        ".env.local. Aggiungi la tua API key oppure torna a AI_PROVIDER=mock."
    );
  }

  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? DEFAULT_MODEL,
    instructions: input.system,
    input: input.prompt,
  });

  return response.output_text;
}

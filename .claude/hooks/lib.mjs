// Funzioni condivise dagli hook di sicurezza.
// Ogni hook legge da stdin il JSON che Claude Code gli passa dopo un
// Edit/Write, controlla il file appena modificato e, se trova un problema,
// esce con codice 2: il messaggio su stderr torna all'agente, che deve
// correggere prima di andare avanti.

import { readFileSync } from "node:fs";

export function readHookInput() {
  const raw = readFileSync(0, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function readEditedFile(input) {
  const filePath = input?.tool_input?.file_path;
  if (!filePath) return null;
  try {
    return { filePath, content: readFileSync(filePath, "utf8") };
  } catch {
    return null;
  }
}

export function block(message) {
  process.stderr.write(message + "\n");
  process.exit(2);
}

// Nomi di variabile che con ogni probabilità contengono un segreto.
export const SECRET_NAME_PATTERN =
  /(SECRET|PRIVATE|SERVICE_ROLE|TOKEN|PASSWORD|API_KEY|APIKEY)/i;

// Blocca i riferimenti a variabili d'ambiente server-side dentro i
// Client Component. Il codice con "use client" gira nel browser: lì i
// segreti non esistono (Next.js li sostituisce con undefined) e il solo
// provarci indica un errore di architettura da correggere subito.

import {
  readHookInput,
  readEditedFile,
  block,
} from "./lib.mjs";

const input = readHookInput();
const file = readEditedFile(input);
if (!file) process.exit(0);

const isCodeFile = /\.(ts|tsx|js|jsx)$/.test(file.filePath);
const isClientComponent = /^\s*["']use client["']/m.test(file.content);
if (!isCodeFile || !isClientComponent) process.exit(0);

const envRefs = file.content.match(/process\.env\.([A-Z0-9_]+)/g) ?? [];
const serverOnly = [
  ...new Set(
    envRefs
      .map((ref) => ref.replace("process.env.", ""))
      .filter((name) => !name.startsWith("NEXT_PUBLIC_") && name !== "NODE_ENV")
  ),
];

if (serverOnly.length > 0) {
  block(
    `SICUREZZA — ${file.filePath} è un Client Component ("use client") ma legge variabili d'ambiente ` +
      `server-side: ${serverOnly.join(", ")}. Nel browser queste variabili non esistono e non devono ` +
      "arrivarci. Sposta la logica che le usa in codice server (Route Handler, Server Component o " +
      "Server Action) e fai chiamare quel codice dal client."
  );
}

process.exit(0);

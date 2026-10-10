// Blocca le response API che includono variabili d'ambiente.
// Un Route Handler che mette process.env dentro la risposta JSON sta
// spedendo la configurazione del server (spesso segreti) al browser.

import { readHookInput, readEditedFile, block } from "./lib.mjs";

const input = readHookInput();
const file = readEditedFile(input);
if (!file) process.exit(0);

if (!/\.(ts|tsx|js|jsx)$/.test(file.filePath)) process.exit(0);

// Trova ogni chiamata a *.json(...) / Response(...) e controlla se dentro
// gli argomenti compare process.env. Scansione a parentesi bilanciate.
function argumentsContainEnv(content) {
  const findings = [];
  const callPattern = /(?:\.json|new Response|NextResponse)\s*\(/g;
  let match;
  while ((match = callPattern.exec(content)) !== null) {
    let depth = 1;
    let i = match.index + match[0].length;
    const start = i;
    while (i < content.length && depth > 0) {
      if (content[i] === "(") depth++;
      if (content[i] === ")") depth--;
      i++;
    }
    const args = content.slice(start, i);
    const envRef = args.match(/process\.env(?:\.[A-Z0-9_]+)?/);
    if (envRef) findings.push(envRef[0]);
  }
  return findings;
}

const findings = argumentsContainEnv(file.content);

if (findings.length > 0) {
  block(
    `SICUREZZA — In ${file.filePath} una response API include variabili d'ambiente ` +
      `(${[...new Set(findings)].join(", ")}). Le variabili d'ambiente del server non vanno mai ` +
      "inserite nella risposta: chi riceve la response le leggerebbe in chiaro. Usa il valore solo " +
      "sul server e restituisci al client soltanto i dati che gli servono davvero."
  );
}

process.exit(0);

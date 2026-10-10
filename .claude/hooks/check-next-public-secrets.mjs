// Blocca le variabili NEXT_PUBLIC_ che sembrano contenere segreti.
// Tutto ciò che inizia con NEXT_PUBLIC_ finisce nel bundle del browser
// ed è visibile a chiunque: un segreto lì è un segreto pubblicato.

import {
  readHookInput,
  readEditedFile,
  block,
  SECRET_NAME_PATTERN,
} from "./lib.mjs";

const input = readHookInput();
const file = readEditedFile(input);
if (!file) process.exit(0);

const matches = file.content.match(/NEXT_PUBLIC_[A-Z0-9_]+/g) ?? [];
const sospette = [
  ...new Set(
    matches.filter((name) =>
      SECRET_NAME_PATTERN.test(name.replace("NEXT_PUBLIC_", ""))
    )
  ),
  // Le key "publishable" sono pensate per essere pubbliche: ok.
].filter((name) => !/PUBLISHABLE/i.test(name));

if (sospette.length > 0) {
  block(
    `SICUREZZA — In ${file.filePath} c'è una variabile NEXT_PUBLIC_ dal nome sospetto: ${sospette.join(", ")}. ` +
      "Le variabili NEXT_PUBLIC_ vengono incluse nel codice inviato al browser e sono visibili a chiunque: " +
      "un segreto non deve MAI avere questo prefisso. Rinomina la variabile senza NEXT_PUBLIC_ e usala solo " +
      "in codice server (Route Handler, Server Component, Server Action)."
  );
}

process.exit(0);

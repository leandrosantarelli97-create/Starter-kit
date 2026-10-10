// Blocca i webhook Stripe che non verificano la firma.
// Senza stripe.webhooks.constructEvent(...) chiunque può chiamare il tuo
// endpoint fingendosi Stripe e, per esempio, attivarsi un piano Pro gratis.

import { readHookInput, readEditedFile, block } from "./lib.mjs";

const input = readHookInput();
const file = readEditedFile(input);
if (!file) process.exit(0);

const isRouteFile = /route\.(ts|js)$/.test(file.filePath);
const isStripeWebhook =
  /stripe/i.test(file.filePath + file.content) &&
  /webhook/i.test(file.filePath + file.content);

if (!isRouteFile || !isStripeWebhook) process.exit(0);

const verificaFirma = /constructEvent(Async)?\s*\(/.test(file.content);

if (!verificaFirma) {
  block(
    `SICUREZZA — ${file.filePath} sembra un webhook Stripe ma non verifica la firma della richiesta. ` +
      "Senza verifica, chiunque può chiamare questo endpoint fingendosi Stripe. Leggi il body grezzo con " +
      "request.text(), prendi l'header \"Stripe-Signature\" e valida con " +
      "stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET). " +
      "Processa l'evento solo se la verifica riesce."
  );
}

process.exit(0);

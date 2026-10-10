import { createBrowserClient } from "@supabase/ssr";

// Client Supabase per i Client Component (codice che gira nel browser).
// Usa solo la Publishable key: è pensata per essere pubblica, i dati sono
// protetti dalle policy RLS sul database.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase non è ancora configurato. Copia .env.example in .env.local e " +
        "inserisci NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY " +
        "(li trovi nel dashboard del tuo progetto Supabase). " +
        "Questo passaggio si fa nel Modulo 2 del corso."
    );
  }

  return createBrowserClient(url, key);
}

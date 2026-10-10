import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client Supabase per il codice server (Server Component, Route Handler,
// Server Action). Legge la sessione dell'utente dai cookie della richiesta.
export async function createClient() {
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

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Chiamato da un Server Component: i cookie non si possono
          // scrivere qui, ci pensa il proxy a rinfrescare la sessione.
        }
      },
    },
  });
}

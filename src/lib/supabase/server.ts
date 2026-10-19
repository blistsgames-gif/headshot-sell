// Cliente Supabase para o servidor (páginas, server actions), com a sessão nos cookies.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { configSupabase } from "./config";

export async function createClient() {
  // Ler os cookies primeiro deixa a página dinâmica (nunca gerada com dados de outra pessoa).
  const cookieStore = await cookies();
  const { url, chave } = configSupabase();

  return createServerClient(url, chave, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado de um Server Component: pode ignorar, o middleware renova a sessão.
        }
      },
    },
  });
}

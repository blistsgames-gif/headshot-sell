// Cliente Supabase para o navegador (componentes "use client").
import { createBrowserClient } from "@supabase/ssr";
import { configSupabase } from "./config";

export function createClient() {
  const { url, chave } = configSupabase();
  return createBrowserClient(url, chave);
}

// Lê as variáveis do Supabase e avisa em português se estiverem faltando.

/**
 * Deixa só o endereço base do projeto (https://xxxx.supabase.co).
 * Se alguém colar o endereço da API de tabelas (".../rest/v1/") ou do login
 * (".../auth/v1"), o caminho a mais é removido. Sem isso, o login vai para o
 * endereço errado e o Supabase responde "Invalid path specified in request URL".
 */
export function urlBaseSupabase(url: string) {
  try {
    return new URL(url.trim()).origin;
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL não é um endereço válido. Use só o endereço do projeto, no formato https://xxxx.supabase.co.`,
    );
  }
}

export function configSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !chave) {
    throw new Error(
      "Configuração do Supabase faltando: crie o arquivo .env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (veja o .env.example).",
    );
  }
  return { url: urlBaseSupabase(url), chave: chave.trim() };
}

export function supabaseConfigurado() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

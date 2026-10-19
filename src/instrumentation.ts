// Grava na tabela "erros" todo erro que acontece no servidor.
import type { Instrumentation } from "next";

export function register() {}

const IGNORAR = ["NEXT_REDIRECT", "NEXT_NOT_FOUND", "NEXT_HTTP_ERROR_FALLBACK", "DYNAMIC_SERVER_USAGE", "BAILOUT_TO_CLIENT_SIDE_RENDERING"];

export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  try {
    const erro = err as Error & { digest?: string };
    if (erro?.digest && IGNORAR.some((d) => String(erro.digest).startsWith(d))) return;

    const { supabaseConfigurado, configSupabase } = await import("@/lib/supabase/config");
    if (!supabaseConfigurado()) return;
    const { url, chave } = configSupabase();

    // Usa os cookies da requisição para saber qual usuário estava logado.
    const { createServerClient, parseCookieHeader } = await import("@supabase/ssr");
    const cookieBruto = request.headers["cookie"];
    const cookieHeader = Array.isArray(cookieBruto) ? cookieBruto.join("; ") : (cookieBruto ?? "");
    const supabase = createServerClient(url, chave, {
      cookies: {
        getAll: () => parseCookieHeader(cookieHeader).map((c) => ({ name: c.name, value: c.value ?? "" })),
        setAll: () => {},
      },
    });

    await supabase.rpc("registrar_erro", {
      p_origem: "servidor",
      p_pagina: request.path,
      p_mensagem: erro?.message || String(err),
      p_detalhes: JSON.stringify(
        {
          pilha: erro?.stack,
          digest: erro?.digest,
          metodo: request.method,
          rota: context.routePath,
          tipo: context.routeType,
          ambiente: process.env.NEXT_PUBLIC_AMBIENTE,
        },
        null,
        2,
      ),
    });
  } catch {
    // Nunca deixar o registro de erro derrubar o programa.
  }
};

// Renova a sessão a cada acesso e manda para o login quem não está logado.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { configSupabase, supabaseConfigurado } from "./config";

const ROTAS_PUBLICAS = ["/login"];

export async function updateSession(request: NextRequest) {
  if (!supabaseConfigurado()) {
    return new NextResponse(
      "Configuração faltando: crie o arquivo .env.local com os dados do Supabase (veja o .env.example) e reinicie o programa.",
      { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  const { url: urlSupabase, chave } = configSupabase();
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    urlSupabase,
    chave,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    },
  );

  // Não coloque nada entre createServerClient e getClaims (recomendação oficial).
  const { data } = await supabase.auth.getClaims();
  const logado = Boolean(data?.claims);

  const caminho = request.nextUrl.pathname;
  const publica = ROTAS_PUBLICAS.some((r) => caminho === r);

  if (!logado && !publica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

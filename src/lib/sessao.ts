// Lê, no servidor, quem está logado, o perfil, as preferências e o segundo fator.
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { paginaInicial, podeAlterar, podeVer, type Papel, type Tema } from "@/lib/menu";

export type Perfil = {
  id: string;
  email: string;
  nome: string | null;
  papel: Papel | null;
  ativo: boolean;
};

export type Sessao =
  | { logado: false }
  | {
      logado: true;
      usuarioId: string;
      email: string;
      perfil: Perfil | null;
      tema: Tema;
      mostrarDica: boolean;
      /** Tem o segundo fator ativado mas ainda não digitou o código nesta sessão. */
      precisaSegundoFator: boolean;
      /** Segundo fator ativado (verificado) na conta. */
      segundoFatorAtivo: boolean;
    };

export const obterSessao = cache(async (): Promise<Sessao> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return { logado: false };

  const [perfilRes, prefRes, aalRes] = await Promise.all([
    supabase.from("perfis").select("id, email, nome, papel, ativo").eq("id", claims.sub).maybeSingle(),
    supabase.from("preferencias_usuario").select("tema, mostrar_dica").eq("usuario_id", claims.sub).maybeSingle(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);

  if (perfilRes.error) {
    throw new Error(
      `Não consegui ler a tabela "perfis" (${perfilRes.error.message}). Confira se a migration 001_base.sql foi rodada no Supabase.`,
    );
  }

  const aal = aalRes.data;
  const segundoFatorAtivo = aal?.nextLevel === "aal2";
  const precisaSegundoFator = segundoFatorAtivo && aal?.currentLevel !== "aal2";

  return {
    logado: true,
    usuarioId: claims.sub,
    email: (claims.email as string | undefined) ?? perfilRes.data?.email ?? "",
    perfil: (perfilRes.data as Perfil | null) ?? null,
    tema: prefRes.data?.tema === "retro" ? "retro" : "moderno",
    mostrarDica: prefRes.data?.mostrar_dica ?? true,
    precisaSegundoFator,
    segundoFatorAtivo,
  };
});

/** Garante login, segundo fator e papel liberado. Devolve o usuário com papel. */
export async function exigirAcesso() {
  const sessao = await obterSessao();
  if (!sessao.logado) redirect("/login");
  if (sessao.precisaSegundoFator) redirect("/login/verificar");
  const perfil = sessao.perfil;
  if (!perfil || !perfil.papel || !perfil.ativo) redirect("/aguardando");
  return { ...sessao, perfil: perfil as Perfil & { papel: Papel }, papel: perfil.papel as Papel };
}

/** Garante que o papel do usuário pode abrir esta página. */
export async function exigirPagina(chave: string) {
  const acesso = await exigirAcesso();
  if (!podeVer(acesso.papel, chave)) redirect(paginaInicial(acesso.papel));
  return { ...acesso, podeAlterar: podeAlterar(acesso.papel) };
}

export async function exigirAdmin() {
  const acesso = await exigirAcesso();
  if (acesso.papel !== "admin") redirect(paginaInicial(acesso.papel));
  return acesso;
}

"use server";
// Ações executadas no servidor, chamadas pelas telas.
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigirAcesso, exigirAdmin } from "@/lib/sessao";

function texto(v: unknown, max: number) {
  return typeof v === "string" ? v.slice(0, max) : "";
}

// ---------------------------------------------------------------- Login
export async function registrarLogin(segundoFator: boolean) {
  const supabase = await createClient();
  const h = await headers();
  const { error } = await supabase.rpc("registrar_auditoria", {
    p_acao: "login",
    p_tabela: null,
    p_registro_id: null,
    p_detalhes: {
      segundo_fator: Boolean(segundoFator),
      navegador: texto(h.get("user-agent"), 300),
    },
  });
  // Falha na auditoria não pode impedir a entrada: vira um registro em "erros".
  if (error) {
    await supabase.rpc("registrar_erro", {
      p_origem: "servidor",
      p_pagina: "/login",
      p_mensagem: `Falha ao registrar o login na auditoria: ${error.message}`,
      p_detalhes: JSON.stringify(error, null, 2),
    });
  }
}

export async function sair() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) {
    await supabase.rpc("registrar_auditoria", { p_acao: "logout", p_tabela: null, p_registro_id: null, p_detalhes: {} });
  }
  await supabase.auth.signOut();
  redirect("/login");
}

// ---------------------------------------------------------------- Erros
export async function registrarErro(dados: { pagina?: string; mensagem?: string; detalhes?: string }) {
  try {
    const supabase = await createClient();
    await supabase.rpc("registrar_erro", {
      p_origem: "navegador",
      p_pagina: texto(dados?.pagina, 500),
      p_mensagem: texto(dados?.mensagem, 5000) || "(sem mensagem)",
      p_detalhes: texto(dados?.detalhes, 20000),
    });
  } catch {
    // Se nem o registro de erro funcionar, não há o que fazer aqui.
  }
}

export async function marcarErroResolvido(id: number, resolvido: boolean) {
  await exigirAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("erros").update({ resolvido: Boolean(resolvido) }).eq("id", Number(id));
  if (error) throw new Error(`Não consegui marcar o erro: ${error.message}`);
  revalidatePath("/configuracoes/erros");
}


// ---------------------------------------------------------------- Preferências
export async function salvarTema(tema: string) {
  const acesso = await exigirAcesso();
  const valor = tema === "retro" ? "retro" : "moderno";
  const supabase = await createClient();
  const { error } = await supabase
    .from("preferencias_usuario")
    .upsert({ usuario_id: acesso.usuarioId, tema: valor }, { onConflict: "usuario_id" });
  if (error) throw new Error(`Não consegui salvar o tema: ${error.message}`);
  revalidatePath("/", "layout");
}

export async function salvarMostrarDica(mostrar: boolean) {
  const acesso = await exigirAcesso();
  const supabase = await createClient();
  const { error } = await supabase
    .from("preferencias_usuario")
    .upsert({ usuario_id: acesso.usuarioId, mostrar_dica: Boolean(mostrar) }, { onConflict: "usuario_id" });
  if (error) throw new Error(`Não consegui salvar a preferência: ${error.message}`);
}

// ---------------------------------------------------------------- Segurança
export async function registrarSegundoFator(acao: "ativou" | "desativou") {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return;
  await supabase.rpc("registrar_auditoria", {
    p_acao: "alterou",
    p_tabela: "segundo_fator",
    p_registro_id: data.claims.sub,
    p_detalhes: { acao: acao === "ativou" ? "ativou" : "desativou" },
  });
}

// ---------------------------------------------------------------- IA
export async function salvarConfigIa(formData: FormData) {
  await exigirAdmin();
  const teto = Number(String(formData.get("teto") ?? "").replace(",", "."));
  const alerta = Math.round(Number(formData.get("alerta")));
  const bloquear = formData.get("bloquear") === "on";
  if (!Number.isFinite(teto) || teto < 0) throw new Error("Teto inválido.");
  if (!Number.isFinite(alerta) || alerta < 1 || alerta > 100) throw new Error("Percentual de alerta deve ser de 1 a 100.");
  const supabase = await createClient();
  const { error } = await supabase
    .from("config_ia")
    .update({ teto_mensal_reais: teto, percentual_alerta: alerta, bloquear_ao_atingir_teto: bloquear })
    .eq("id", 1);
  if (error) throw new Error(`Não consegui salvar: ${error.message}`);
  revalidatePath("/configuracoes/ia");
}

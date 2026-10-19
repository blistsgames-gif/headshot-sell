"use client";
// Escuta erros da tela (no navegador) e grava na tabela "erros".
import { useEffect } from "react";
import { registrarErro } from "@/lib/acoes";

const recentes = new Map<string, number>();

export function enviarErroDaTela(erro: unknown, extra?: string) {
  const e = erro instanceof Error ? erro : new Error(typeof erro === "string" ? erro : JSON.stringify(erro));
  const chave = e.message;
  const agora = Date.now();
  // Não repetir o mesmo erro em menos de 10 segundos.
  if ((recentes.get(chave) ?? 0) > agora - 10_000) return;
  recentes.set(chave, agora);

  const detalhes = [
    e.stack ?? "",
    extra ?? "",
    `Navegador: ${navigator.userAgent}`,
    `Tela: ${window.innerWidth}x${window.innerHeight}`,
    `Hora: ${new Date().toLocaleString("pt-BR")}`,
  ]
    .filter(Boolean)
    .join("\n");

  void registrarErro({ pagina: window.location.pathname + window.location.search, mensagem: e.message, detalhes });
}

export function CapturaErros() {
  useEffect(() => {
    const aoErro = (ev: ErrorEvent) => enviarErroDaTela(ev.error ?? ev.message, `${ev.filename}:${ev.lineno}:${ev.colno}`);
    const aoRejeitar = (ev: PromiseRejectionEvent) => enviarErroDaTela(ev.reason, "Promessa rejeitada sem tratamento");
    window.addEventListener("error", aoErro);
    window.addEventListener("unhandledrejection", aoRejeitar);
    return () => {
      window.removeEventListener("error", aoErro);
      window.removeEventListener("unhandledrejection", aoRejeitar);
    };
  }, []);
  return null;
}

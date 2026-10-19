"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { registrarLogin, sair } from "@/lib/acoes";

export function FormCodigo() {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function verificar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const supabase = createClient();
      const { data: fatores, error: erroFatores } = await supabase.auth.mfa.listFactors();
      if (erroFatores) throw erroFatores;
      const totp = fatores.totp.find((f) => f.status === "verified");
      if (!totp) {
        setErro("Nenhum aplicativo autenticador ativado nesta conta.");
        return;
      }
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: totp.id, code: codigo.trim() });
      if (error) {
        setErro("Código incorreto ou vencido. Confira o código no aplicativo e tente de novo.");
        return;
      }
      await registrarLogin(true);
      window.location.assign("/");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
      throw err;
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={verificar} className="space-y-4">
      <p className="text-sm text-secundario">
        Abra o aplicativo autenticador (Google Authenticator, Microsoft Authenticator ou similar) e digite o código
        de 6 números do HeadShot Sell.
      </p>
      <input
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        autoFocus
        value={codigo}
        onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
        className="hs-campo text-center text-2xl tracking-[0.4em] font-mono"
        aria-label="Código de 6 números"
      />
      {erro && <p className="text-sm text-alvo">{erro}</p>}
      <button type="submit" disabled={enviando || codigo.length !== 6} className="hs-botao hs-botao-principal w-full">
        {enviando ? "Conferindo…" : "Confirmar"}
      </button>
      <button type="button" onClick={() => sair()} className="hs-botao w-full">
        Sair
      </button>
    </form>
  );
}

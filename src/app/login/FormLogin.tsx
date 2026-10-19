"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { registrarLogin } from "@/lib/acoes";

export function FormLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [respostaOriginal, setRespostaOriginal] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setRespostaOriginal("");
    setEnviando(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) {
        // Resposta do Supabase exatamente como veio, para diagnóstico.
        setRespostaOriginal(
          [error.message, error.status ? `HTTP ${error.status}` : "", error.code ?? ""].filter(Boolean).join(" · "),
        );
        // Só fala em senha errada quando o Supabase diz exatamente isso.
        if (error.code === "invalid_credentials") setErro("E-mail ou senha incorretos.");
        else if (error.code === "email_not_confirmed") setErro("E-mail ainda não confirmado no Supabase.");
        else if (error.status === 404) setErro("Endereço do Supabase errado. Confira NEXT_PUBLIC_SUPABASE_URL.");
        else setErro("Não foi possível entrar. Veja a resposta do Supabase abaixo.");
        return;
      }

      // Tem segundo fator ativado? Então pede o código antes de entrar.
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
        window.location.assign("/login/verificar");
        return;
      }

      await registrarLogin(false);
      window.location.assign("/");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado ao entrar.");
      throw err;
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="space-y-4">
      <label className="block">
        <span className="text-sm text-secundario">E-mail</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="hs-campo mt-1"
        />
      </label>
      <label className="block">
        <span className="text-sm text-secundario">Senha</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="hs-campo mt-1"
        />
      </label>
      {erro && <p className="text-sm text-alvo">{erro}</p>}
      {respostaOriginal && (
        <p className="text-xs text-secundario break-words">
          Resposta do Supabase: <span className="font-mono">{respostaOriginal}</span>
        </p>
      )}
      <button type="submit" disabled={enviando} className="hs-botao hs-botao-principal w-full">
        {enviando ? "Entrando…" : "Entrar"}
      </button>
      <p className="text-xs text-secundario">Sem cadastro aberto: o acesso é criado pelo administrador.</p>
    </form>
  );
}

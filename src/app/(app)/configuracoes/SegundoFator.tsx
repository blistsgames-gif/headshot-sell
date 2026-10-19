"use client";
// Ativar/desativar o segundo fator (código do aplicativo autenticador, TOTP do Supabase).
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registrarSegundoFator } from "@/lib/acoes";

type Inscricao = { factorId: string; qr: string; segredo: string };

function qrComoImagem(qr: string) {
  return qr.startsWith("data:") ? qr : `data:image/svg+xml;utf-8,${encodeURIComponent(qr)}`;
}

export function SegundoFator() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [fatorAtivo, setFatorAtivo] = useState<string | null>(null);
  const [inscricao, setInscricao] = useState<Inscricao | null>(null);
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) setErro(error.message);
    setFatorAtivo(data?.totp[0]?.id ?? null);
    setCarregando(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function iniciar() {
    setErro("");
    setOcupado(true);
    try {
      const supabase = createClient();
      // Limpa tentativas antigas que não foram concluídas.
      const { data: lista } = await supabase.auth.mfa.listFactors();
      for (const f of lista?.all ?? []) {
        if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `HeadShot Sell ${new Date().toISOString().slice(0, 16)}`,
        issuer: "HeadShot Sell",
      });
      if (error) throw error;
      setInscricao({ factorId: data.id, qr: qrComoImagem(data.totp.qr_code), segredo: data.totp.secret });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui iniciar a ativação.");
    } finally {
      setOcupado(false);
    }
  }

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    if (!inscricao) return;
    setErro("");
    setOcupado(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: inscricao.factorId, code: codigo.trim() });
      if (error) {
        setErro("Código incorreto. Confira o código no aplicativo e tente de novo.");
        return;
      }
      await registrarSegundoFator("ativou");
      setInscricao(null);
      setCodigo("");
      await carregar();
      router.refresh();
    } finally {
      setOcupado(false);
    }
  }

  async function cancelar() {
    if (inscricao) {
      const supabase = createClient();
      await supabase.auth.mfa.unenroll({ factorId: inscricao.factorId });
    }
    setInscricao(null);
    setCodigo("");
    setErro("");
  }

  async function desativar() {
    if (!fatorAtivo) return;
    if (!window.confirm("Desativar o segundo fator? A sua conta fica protegida só pela senha.")) return;
    setErro("");
    setOcupado(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.unenroll({ factorId: fatorAtivo });
      if (error) throw error;
      await supabase.auth.refreshSession();
      await registrarSegundoFator("desativou");
      await carregar();
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui desativar.");
    } finally {
      setOcupado(false);
    }
  }

  if (carregando) return <p className="text-sm">Carregando…</p>;

  if (fatorAtivo) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="hs-etiqueta">
          <span className="text-positivo" aria-hidden="true">
            ●
          </span>{" "}
          Segundo fator ativado
        </span>
        <button type="button" className="hs-botao hs-botao-pequeno" onClick={desativar} disabled={ocupado}>
          Desativar
        </button>
        {erro && <p className="w-full text-sm text-alvo">{erro}</p>}
      </div>
    );
  }

  if (inscricao) {
    return (
      <form onSubmit={confirmar} className="grid gap-4">
        <ol className="list-decimal pl-5 text-sm space-y-1">
          <li>Instale no celular o Google Authenticator ou o Microsoft Authenticator.</li>
          <li>No aplicativo, toque em “+” e leia o QR code abaixo.</li>
          <li>Digite aqui o código de 6 números que aparecer.</li>
        </ol>
        <div className="flex flex-wrap items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={inscricao.qr} alt="QR code para o aplicativo autenticador" width={180} height={180} className="bg-white p-2 border" />
          <div className="text-sm min-w-0">
            <p className="text-secundario">Não consegue ler o QR? Digite esta chave no aplicativo:</p>
            <code className="block mt-1 break-all font-mono">{inscricao.segredo}</code>
          </div>
        </div>
        <label className="grid gap-1 max-w-xs">
          <span className="text-sm">Código de 6 números</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            className="hs-campo font-mono tracking-[0.3em]"
          />
        </label>
        {erro && <p className="text-sm text-alvo">{erro}</p>}
        <div className="flex gap-2">
          <button type="submit" className="hs-botao hs-botao-principal" disabled={ocupado || codigo.length !== 6}>
            Confirmar e ativar
          </button>
          <button type="button" className="hs-botao" onClick={cancelar} disabled={ocupado}>
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="hs-etiqueta">Desativado</span>
      <button type="button" className="hs-botao hs-botao-principal hs-botao-pequeno" onClick={iniciar} disabled={ocupado}>
        Ativar segundo fator
      </button>
      {erro && <p className="w-full text-sm text-alvo">{erro}</p>}
    </div>
  );
}

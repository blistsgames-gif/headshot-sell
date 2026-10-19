"use client";
import { useState } from "react";
import type { Tema } from "@/lib/menu";
import { salvarTema } from "@/lib/acoes";

function MiniModerno() {
  return (
    <div className="h-20 rounded-md overflow-hidden flex border" style={{ background: "#F6F7F9", borderColor: "#E6E8EC" }}>
      <div className="w-1/4 bg-white border-r" style={{ borderColor: "#E6E8EC" }} />
      <div className="flex-1 p-2 space-y-1.5">
        <div className="h-2 w-2/3 rounded bg-white border" style={{ borderColor: "#E6E8EC" }} />
        <div className="h-4 w-1/3 rounded" style={{ background: "#111418" }} />
        <div className="h-1.5 w-1/2 rounded" style={{ background: "#C8102E" }} />
      </div>
    </div>
  );
}

function MiniRetro() {
  return (
    <div className="h-20 overflow-hidden p-1.5" style={{ background: "#008080" }}>
      <div className="h-full" style={{ background: "#C0C0C0", boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #fff" }}>
        <div className="h-2.5" style={{ background: "linear-gradient(90deg,#000080,#1084D0)" }} />
        <div className="p-1.5">
          <div className="h-4 w-1/2" style={{ background: "#000" }}>
            <div className="h-full w-2/3" style={{ background: "repeating-linear-gradient(90deg,#33ff66 0 3px,transparent 3px 5px)", opacity: 0.8 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SeletorTema({ temaAtual }: { temaAtual: Tema }) {
  const [salvando, setSalvando] = useState<Tema | null>(null);
  const [erro, setErro] = useState("");

  async function escolher(tema: Tema) {
    if (tema === temaAtual || salvando) return;
    setErro("");
    setSalvando(tema);
    try {
      await salvarTema(tema);
      // Recarrega para aplicar a nova pele por inteiro.
      window.location.reload();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui salvar o tema.");
      setSalvando(null);
      throw e;
    }
  }

  const opcoes: { tema: Tema; nome: string; descricao: string; mini: React.ReactNode }[] = [
    { tema: "moderno", nome: "Tema Moderno", descricao: "Minimalista, claro, com vermelho só no que exige atenção.", mini: <MiniModerno /> },
    { tema: "retro", nome: "Tema Retrô", descricao: "Estilo Windows 98: janelas cinza, LCD verde e barra Iniciar.", mini: <MiniRetro /> },
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {opcoes.map((o) => (
          <button
            key={o.tema}
            type="button"
            className="hs-opcao-tema"
            aria-pressed={temaAtual === o.tema}
            disabled={salvando !== null}
            onClick={() => escolher(o.tema)}
          >
            {o.mini}
            <span className="font-semibold">
              {o.nome}
              {temaAtual === o.tema ? " (em uso)" : ""}
              {salvando === o.tema ? " — aplicando…" : ""}
            </span>
            <span className="text-sm opacity-75">{o.descricao}</span>
          </button>
        ))}
      </div>
      {erro && <p className="text-sm text-alvo mt-3">{erro}</p>}
    </div>
  );
}

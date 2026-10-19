"use client";
// "Dica do dia": janela de diálogo no Retrô, faixa discreta no Moderno.
// Aparece uma vez por sessão, se "Mostrar ao iniciar" estiver marcado.
import { useEffect, useState } from "react";
import { useTema } from "@/components/shell/TemaContexto";
import { salvarMostrarDica } from "@/lib/acoes";

export function DicaDoDia({ texto }: { texto: string }) {
  const { tema, mostrarDica } = useTema();
  const [aberta, setAberta] = useState(false);
  const [mostrarAoIniciar, setMostrarAoIniciar] = useState(mostrarDica);

  useEffect(() => {
    if (!mostrarDica) return;
    try {
      if (sessionStorage.getItem("hs-dica") === "1") return;
    } catch {
      // sem armazenamento: mostra mesmo assim
    }
    setAberta(true);
  }, [mostrarDica]);

  function fechar() {
    try {
      sessionStorage.setItem("hs-dica", "1");
    } catch {
      // ignora
    }
    setAberta(false);
    if (mostrarAoIniciar !== mostrarDica) void salvarMostrarDica(mostrarAoIniciar);
  }

  if (!aberta) return null;

  if (tema === "retro") {
    return (
      <div className="fixed inset-0 z-[70] grid place-items-center p-4 pointer-events-none">
        <div className="window w-full max-w-[420px] pointer-events-auto" role="dialog" aria-label="Dica do dia">
          <div className="title-bar">
            <div className="title-bar-text">Dica do dia</div>
            <div className="title-bar-controls">
              <button aria-label="Close" onClick={fechar} />
            </div>
          </div>
          <div className="window-body">
            <div className="flex gap-3 bg-white p-3" style={{ boxShadow: "inset -1px -1px #fff, inset 1px 1px #808080" }}>
              <span className="text-3xl leading-none font-bold" style={{ color: "#808000" }} aria-hidden="true">
                ?
              </span>
              <div>
                <p className="font-bold mb-1">Você sabia…</p>
                <p>{texto}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="field-row">
                <input
                  id="dica-mostrar"
                  type="checkbox"
                  checked={mostrarAoIniciar}
                  onChange={(e) => setMostrarAoIniciar(e.target.checked)}
                />
                <label htmlFor="dica-mostrar">Mostrar ao iniciar</label>
              </div>
              <button className="default" onClick={fechar} autoFocus>
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hs-dica" role="note">
      <span className="text-alvo font-semibold shrink-0">Dica do dia</span>
      <div className="flex-1 min-w-0">
        <p>{texto}</p>
        <label className="mt-2 inline-flex items-center gap-2 text-xs text-secundario">
          <input type="checkbox" checked={mostrarAoIniciar} onChange={(e) => setMostrarAoIniciar(e.target.checked)} />
          Mostrar ao iniciar
        </label>
      </div>
      <button type="button" className="hs-botao hs-botao-pequeno" onClick={fechar}>
        OK
      </button>
    </div>
  );
}

"use client";
// Tela de abertura do tema Retrô, com barra de carregamento em blocos.
// Aparece uma vez por sessão do navegador.
import { useEffect, useState } from "react";

export function SplashRetro() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    let jaViu = false;
    try {
      jaViu = sessionStorage.getItem("hs-splash") === "1";
      sessionStorage.setItem("hs-splash", "1");
    } catch {
      jaViu = true;
    }
    if (jaViu) return;
    setVisivel(true);
    const id = setTimeout(() => setVisivel(false), 1600);
    return () => clearTimeout(id);
  }, []);

  if (!visivel) return null;

  return (
    <div className="hs98-splash" onClick={() => setVisivel(false)} role="presentation">
      <div className="window hs98-splash-janela">
        <div className="window-body">
          <div className="flex items-center gap-4 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icones/alvo.svg" alt="" width={56} height={56} />
            <div>
              <div className="hs98-splash-titulo">HeadShot Sell</div>
              <div>Linha MDM · versão 0.1</div>
            </div>
          </div>
          <div className="progress-indicator segmented">
            <span className="progress-indicator-bar hs98-splash-barra" />
          </div>
          <p className="mt-2">Carregando…</p>
        </div>
      </div>
    </div>
  );
}

"use client";
// Casca do programa: escolhe o tema e cuida dos atalhos de teclado.
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { PropsCasca, PropsShell } from "./tipos";
import { TemaContexto } from "./TemaContexto";
import { ShellModerno } from "./ShellModerno";
import { ShellRetro } from "./ShellRetro";

export function AppShell(props: PropsShell) {
  const caminho = usePathname();
  const router = useRouter();
  const [gaveta, setGaveta] = useState(false);
  const temAlvos = props.paginas.some((p) => p.chave === "alvos");

  // Fecha a gaveta ao trocar de página.
  useEffect(() => setGaveta(false), [caminho]);

  // Atalhos: F2 = Mira, F3 = Alvos do dia, Esc = fecha a gaveta.
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "F2") {
        e.preventDefault();
        const campo = document.getElementById("mira-busca") as HTMLInputElement | null;
        campo?.focus();
        campo?.select();
      } else if (e.key === "F3") {
        e.preventDefault();
        if (temAlvos) router.push("/alvos");
      } else if (e.key === "Escape") {
        setGaveta(false);
      }
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [router, temAlvos]);

  const casca: PropsCasca = { ...props, caminho, gaveta, setGaveta };

  return (
    <TemaContexto.Provider value={{ tema: props.tema, mostrarDica: props.mostrarDica }}>
      <div data-tema={props.tema} className="hs-raiz">
        {props.tema === "retro" && (
          // Folha de estilo do 98.css: só carrega no tema Retrô.
          // eslint-disable-next-line @next/next/no-css-tags
          <link rel="stylesheet" href="/retro/98.css" precedence="default" />
        )}
        {props.tema === "retro" ? <ShellRetro {...casca} /> : <ShellModerno {...casca} />}
      </div>
    </TemaContexto.Provider>
  );
}


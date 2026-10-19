"use client";
// Barra de perguntas da Mira (IA). Ainda vazia: chega na Etapa 3.
import { useState } from "react";
import { Icone } from "./Icone";

export function MiraBusca({ retro = false }: { retro?: boolean }) {
  const [aviso, setAviso] = useState(false);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setAviso(true);
    setTimeout(() => setAviso(false), 3000);
  }

  return (
    <form onSubmit={enviar} className={retro ? "hs98-mira" : "hs-mira"} role="search">
      {retro ? (
        <label htmlFor="mira-busca" className="whitespace-nowrap">
          <u>M</u>ira:
        </label>
      ) : (
        <Icone nome="busca" tamanho={16} className="text-secundario shrink-0" />
      )}
      <input
        id="mira-busca"
        type="search"
        placeholder={aviso ? "A Mira chega na Etapa 3." : "Pergunte à Mira…"}
        autoComplete="off"
        className="min-w-0 flex-1"
      />
      <kbd className="hs-kbd hidden sm:inline">F2</kbd>
    </form>
  );
}

"use client";
// Tema Moderno: menu lateral simples, Mira no topo, muito espaço em branco.
import Link from "next/link";
import { NOME_PAPEL } from "@/lib/menu";
import { sair } from "@/lib/acoes";
import { SeloTeste } from "@/components/SeloTeste";
import { estaAtiva, type PropsCasca } from "./tipos";
import { Icone } from "./Icone";
import { MiraBusca } from "./MiraBusca";
import { AvisoSegundoFator } from "./AvisoSegundoFator";

function Menu({ paginas, caminho, errosAbertos }: Pick<PropsCasca, "paginas" | "caminho" | "errosAbertos">) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-2">
      <ul className="space-y-0.5">
        {paginas.map((p) => {
          const ativa = estaAtiva(caminho, p.href);
          const contador = p.chave === "configuracoes" && errosAbertos > 0 ? errosAbertos : null;
          return (
            <li key={p.chave}>
              <Link href={p.href} className="hs-menu-item" aria-current={ativa ? "page" : undefined}>
                <Icone nome={p.chave} />
                <span className="flex-1">{p.rotulo}</span>
                {contador !== null && (
                  <span className="hs-contador hs-contador-alerta" title="Erros não resolvidos">
                    {contador}
                  </span>
                )}
                {p.atalho && <kbd className="hs-kbd">{p.atalho}</kbd>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Marca() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-5 h-14 shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icones/alvo.svg" alt="" width={26} height={26} className="rounded-md" />
      <span className="font-semibold tracking-tight">HeadShot Sell</span>
    </Link>
  );
}

function Usuario({ nome, email, papel }: Pick<PropsCasca, "nome" | "email" | "papel">) {
  return (
    <div className="border-t border-borda px-5 py-4 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{nome || email}</div>
        <div className="text-xs text-secundario">{NOME_PAPEL[papel]}</div>
      </div>
      <form action={sair}>
        <button type="submit" className="hs-icone-botao" title="Sair" aria-label="Sair">
          <Icone nome="sair" />
        </button>
      </form>
    </div>
  );
}

export function ShellModerno(props: PropsCasca) {
  const { paginas, caminho, errosAbertos, gaveta, setGaveta } = props;

  return (
    <div className="min-h-dvh bg-fundo text-texto">
      {/* Menu lateral fixo (computador) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-superficie border-r border-borda">
        <Marca />
        <Menu paginas={paginas} caminho={caminho} errosAbertos={errosAbertos} />
        <Usuario nome={props.nome} email={props.email} papel={props.papel} />
      </aside>

      {/* Gaveta (celular) */}
      {gaveta && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="hs-veu" aria-label="Fechar menu" onClick={() => setGaveta(false)} />
          <aside className="hs-gaveta absolute z-50 inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col bg-superficie shadow-xl">
            <div className="flex items-center justify-between pr-3">
              <Marca />
              <button className="hs-icone-botao" aria-label="Fechar menu" onClick={() => setGaveta(false)}>
                <Icone nome="fechar" />
              </button>
            </div>
            <Menu paginas={paginas} caminho={caminho} errosAbertos={errosAbertos} />
            <Usuario nome={props.nome} email={props.email} papel={props.papel} />
          </aside>
        </div>
      )}

      <div className="md:pl-60 flex flex-col min-h-dvh">
        <header className="sticky top-0 z-30 bg-fundo/90 backdrop-blur border-b border-borda">
          <div className="flex items-center gap-2 h-14 px-3 md:px-8">
            <button className="hs-icone-botao md:hidden" aria-label="Abrir menu" onClick={() => setGaveta(true)}>
              <Icone nome="menu" tamanho={20} />
            </button>
            <MiraBusca />
          </div>
        </header>

        {props.avisoSegundoFator && <AvisoSegundoFator />}

        <main className="flex-1 w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">{props.children}</main>

        <footer className="px-4 md:px-8 py-4 text-xs text-secundario flex items-center gap-3">
          <SeloTeste />
          <span>HeadShot Sell · versão 0.1 (Etapa 0)</span>
        </footer>
      </div>
    </div>
  );
}

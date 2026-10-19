"use client";
// Tema Retrô (Windows 98): área de trabalho, janela, árvore de pastas e barra de tarefas.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NOME_PAPEL, paginaPorCaminho } from "@/lib/menu";
import { sair } from "@/lib/acoes";
import { SeloTeste } from "@/components/SeloTeste";
import { estaAtiva, type PropsCasca } from "./tipos";
import { Icone } from "./Icone";
import { MiraBusca } from "./MiraBusca";
import { AvisoSegundoFator } from "./AvisoSegundoFator";
import { SplashRetro } from "./SplashRetro";

/** Texto com a primeira letra sublinhada (letra de atalho). */
function Atalho({ texto }: { texto: string }) {
  return (
    <>
      <u>{texto[0]}</u>
      {texto.slice(1)}
    </>
  );
}

function Relogio() {
  const [hora, setHora] = useState("");
  useEffect(() => {
    const atualizar = () => setHora(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    atualizar();
    const id = setInterval(atualizar, 15_000);
    return () => clearInterval(id);
  }, []);
  return <span className="hs98-relogio">{hora}</span>;
}

function ArvorePastas({ paginas, caminho, errosAbertos }: Pick<PropsCasca, "paginas" | "caminho" | "errosAbertos">) {
  return (
    <ul className="tree-view hs98-arvore">
      <li>
        <details open>
          <summary>HeadShot Sell</summary>
          <ul>
            {paginas.map((p) => (
              <li key={p.chave}>
                <Link
                  href={p.href}
                  className="hs98-arvore-item"
                  aria-current={estaAtiva(caminho, p.href) ? "page" : undefined}
                >
                  {p.rotulo}
                  {p.chave === "configuracoes" && errosAbertos > 0 ? ` (${errosAbertos})` : ""}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </li>
    </ul>
  );
}

type MenuAberto = null | "arquivo" | "ir" | "exibir" | "ajuda";

function BarraDeMenus({ paginas }: Pick<PropsCasca, "paginas">) {
  const [aberto, setAberto] = useState<MenuAberto>(null);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(null);
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  function ir(href: string) {
    setAberto(null);
    router.push(href);
  }

  const menus: { chave: Exclude<MenuAberto, null>; rotulo: string; itens: { rotulo: string; acao?: () => void; atalho?: string }[] }[] = [
    { chave: "arquivo", rotulo: "Arquivo", itens: [{ rotulo: "Sair", acao: () => void sair() }] },
    { chave: "ir", rotulo: "Ir", itens: paginas.map((p) => ({ rotulo: p.rotulo, atalho: p.atalho, acao: () => ir(p.href) })) },
    { chave: "exibir", rotulo: "Exibir", itens: [{ rotulo: "Aparência…", acao: () => ir("/configuracoes#aparencia") }] },
    {
      chave: "ajuda",
      rotulo: "Ajuda",
      itens: [
        { rotulo: "Mira", atalho: "F2" },
        { rotulo: "Alvos do dia", atalho: "F3" },
      ],
    },
  ];

  return (
    <div className="hs98-menubar" ref={ref} role="menubar">
      {menus.map((m) => (
        <div key={m.chave} className="relative">
          <button
            type="button"
            role="menuitem"
            className="hs98-menu-titulo"
            aria-expanded={aberto === m.chave}
            onClick={() => setAberto(aberto === m.chave ? null : m.chave)}
          >
            <Atalho texto={m.rotulo} />
          </button>
          {aberto === m.chave && (
            <ul className="hs98-menu-lista window" role="menu">
              {m.itens.map((i) => (
                <li key={i.rotulo} role="menuitem">
                  <button type="button" disabled={!i.acao} onClick={i.acao}>
                    <span>{i.rotulo}</span>
                    {i.atalho && <span>{i.atalho}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function MenuIniciar({ paginas, fechar }: Pick<PropsCasca, "paginas"> & { fechar: () => void }) {
  return (
    <div className="hs98-iniciar-menu window" role="menu">
      <div className="hs98-iniciar-faixa">
        <span>
          <b>HeadShot</b> Sell
        </span>
      </div>
      <ul>
        {paginas.map((p) => (
          <li key={p.chave}>
            <Link href={p.href} onClick={fechar} role="menuitem">
              <Icone nome={p.chave} tamanho={20} />
              <span>{p.rotulo}</span>
            </Link>
          </li>
        ))}
        <li className="hs98-separador" aria-hidden="true" />
        <li>
          <button type="button" onClick={() => void sair()} role="menuitem">
            <Icone nome="sair" tamanho={20} />
            <span>
              <u>S</u>air…
            </span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export function ShellRetro(props: PropsCasca) {
  const { paginas, caminho, errosAbertos, gaveta, setGaveta } = props;
  const [iniciar, setIniciar] = useState(false);
  const paginaAtual = paginaPorCaminho(caminho);
  const titulo = paginaAtual ? `HeadShot Sell - ${paginaAtual.rotulo}` : "HeadShot Sell";

  useEffect(() => setIniciar(false), [caminho]);

  return (
    <div className="hs98-desktop">
      <SplashRetro />

      <div className="hs98-area">
        {/* Ícones da área de trabalho (telas grandes) */}
        <nav className="hs98-icones" aria-label="Atalhos da área de trabalho">
          {paginas.map((p) => (
            <Link key={p.chave} href={p.href} className="hs98-icone-desktop">
              <span className="hs98-icone-figura">
                <Icone nome={p.chave} tamanho={30} />
              </span>
              <span className="hs98-icone-rotulo">{p.rotulo}</span>
            </Link>
          ))}
        </nav>

        <div className="window hs98-janela">
          <div className="title-bar">
            <div className="title-bar-text flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icones/alvo.svg" alt="" width={14} height={14} />
              {titulo}
            </div>
            <div className="title-bar-controls">
              <button aria-label="Minimize" tabIndex={-1} />
              <button aria-label="Maximize" tabIndex={-1} />
              <button aria-label="Close" tabIndex={-1} onClick={() => void sair()} title="Sair" />
            </div>
          </div>

          <BarraDeMenus paginas={paginas} />

          <div className="hs98-ferramentas">
            <button type="button" className="hs98-ferramenta hs-so-celular" onClick={() => setGaveta(true)} aria-label="Abrir menu">
              <Icone nome="menu" tamanho={16} />
              <span>Menu</span>
            </button>
            {paginas.some((p) => p.chave === "alvos") && (
              <Link href="/alvos" className="hs98-ferramenta">
                <Icone nome="alvos" tamanho={16} />
                <span className="hidden sm:inline">Alvos</span>
              </Link>
            )}
            <MiraBusca retro />
          </div>

          {props.avisoSegundoFator && <AvisoSegundoFator />}

          <div className="window-body hs98-corpo">
            <aside className="hs98-lateral sunken-panel hidden md:block">
              <ArvorePastas paginas={paginas} caminho={caminho} errosAbertos={errosAbertos} />
            </aside>
            <main className="hs98-conteudo">{props.children}</main>
          </div>

          <div className="status-bar">
            <p className="status-bar-field">Pronto</p>
            <p className="status-bar-field">{props.nome || props.email}</p>
            <p className="status-bar-field">{NOME_PAPEL[props.papel]}</p>
          </div>
        </div>
      </div>

      {/* Gaveta do celular: janela com a árvore de pastas */}
      {gaveta && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="hs-veu" aria-label="Fechar menu" onClick={() => setGaveta(false)} />
          <div className="window absolute z-50 left-2 right-2 top-2 hs98-gaveta">
            <div className="title-bar">
              <div className="title-bar-text">Menu</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setGaveta(false)} />
              </div>
            </div>
            <div className="window-body">
              <ArvorePastas paginas={paginas} caminho={caminho} errosAbertos={errosAbertos} />
            </div>
          </div>
        </div>
      )}

      {/* Barra de tarefas */}
      <div className="hs98-barra-tarefas">
        {iniciar && (
          <>
            <button className="hs-veu hs-veu-transparente" aria-label="Fechar menu Iniciar" onClick={() => setIniciar(false)} />
            <MenuIniciar paginas={paginas} fechar={() => setIniciar(false)} />
          </>
        )}
        <button
          type="button"
          className={`hs98-iniciar ${iniciar ? "active" : ""}`}
          onClick={() => setIniciar(!iniciar)}
          aria-expanded={iniciar}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icones/alvo.svg" alt="" width={16} height={16} />
          <b>Iniciar</b>
        </button>
        <span className="vertical-bar" aria-hidden="true" />
        <span className="hs98-programa">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icones/alvo.svg" alt="" width={14} height={14} />
          <span className="truncate">{paginaAtual?.rotulo ?? "HeadShot Sell"}</span>
        </span>
        <span className="hs98-bandeja">
          <SeloTeste />
          <Relogio />
        </span>
      </div>
    </div>
  );
}

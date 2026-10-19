"use client";
import { useState, useTransition } from "react";
import { marcarErroResolvido } from "@/lib/acoes";

export type RegistroErro = {
  id: number;
  criado_em: string;
  usuario_email: string | null;
  origem: "navegador" | "servidor";
  pagina: string | null;
  mensagem: string;
  detalhes: string | null;
  resolvido: boolean;
};

function textoCompleto(e: RegistroErro) {
  return [
    `Data: ${new Date(e.criado_em).toLocaleString("pt-BR")}`,
    `Origem: ${e.origem === "servidor" ? "Servidor" : "Tela (navegador)"}`,
    `Usuário: ${e.usuario_email ?? "(sem login)"}`,
    `Página: ${e.pagina ?? "-"}`,
    `Mensagem: ${e.mensagem}`,
    "",
    "Detalhes técnicos:",
    e.detalhes ?? "-",
  ].join("\n");
}

export function LinhaErro({ erro }: { erro: RegistroErro }) {
  const [copiado, setCopiado] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [pendente, iniciar] = useTransition();

  async function copiar() {
    const texto = textoCompleto(erro);
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // Navegadores antigos: seleciona num campo temporário.
      const campo = document.createElement("textarea");
      campo.value = texto;
      document.body.appendChild(campo);
      campo.select();
      document.execCommand("copy");
      campo.remove();
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <li className="hs-cartao" style={{ opacity: erro.resolvido ? 0.6 : 1 }}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-secundario">
        <span>{new Date(erro.criado_em).toLocaleString("pt-BR")}</span>
        <span className="hs-etiqueta">{erro.origem === "servidor" ? "Servidor" : "Tela"}</span>
        {erro.resolvido && <span className="hs-etiqueta">Resolvido</span>}
        <span className="break-all">{erro.usuario_email ?? "sem login"}</span>
        <span className="break-all">{erro.pagina}</span>
      </div>
      <p className="mt-2 font-medium break-words">{erro.mensagem}</p>
      {aberto && erro.detalhes && <pre className="hs-pre mt-2">{erro.detalhes}</pre>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="hs-botao hs-botao-pequeno" onClick={copiar}>
          {copiado ? "Copiado!" : "Copiar mensagem"}
        </button>
        {erro.detalhes && (
          <button type="button" className="hs-botao hs-botao-pequeno" onClick={() => setAberto(!aberto)}>
            {aberto ? "Esconder detalhes" : "Ver detalhes"}
          </button>
        )}
        <button
          type="button"
          className="hs-botao hs-botao-pequeno"
          disabled={pendente}
          onClick={() => iniciar(() => marcarErroResolvido(erro.id, !erro.resolvido))}
        >
          {erro.resolvido ? "Reabrir" : "Marcar resolvido"}
        </button>
      </div>
    </li>
  );
}

"use client";
// Erro dentro de uma página: mostra a mensagem e grava na tabela de erros.
import { useEffect } from "react";
import { enviarErroDaTela } from "@/components/CapturaErros";

export default function ErroPagina({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Erros do servidor (com digest) já foram gravados pelo próprio servidor.
    if (!error.digest) enviarErroDaTela(error, "Erro capturado na página");
  }, [error]);

  return (
    <div className="hs-cartao max-w-2xl">
      <h2>Algo deu errado nesta tela</h2>
      <p className="text-sm mt-1">O erro foi registrado automaticamente. Você pode tentar de novo.</p>
      <pre className="hs-pre mt-3">
        {error.message || "Erro no servidor."}
        {error.digest ? `\nCódigo: ${error.digest}` : ""}
      </pre>
      <button type="button" className="hs-botao mt-3" onClick={() => reset()}>
        Tentar de novo
      </button>
    </div>
  );
}

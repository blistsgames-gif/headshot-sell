"use client";
// Último recurso: erro tão grave que derrubou o layout inteiro.
import { useEffect } from "react";
import { enviarErroDaTela } from "@/components/CapturaErros";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Erros do servidor (com digest) já foram gravados pelo próprio servidor.
    if (!error.digest) enviarErroDaTela(error, "Erro global (layout)");
  }, [error]);

  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 24, background: "#F6F7F9", color: "#111418" }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Algo deu errado</h1>
        <p style={{ color: "#6B7280" }}>O erro foi registrado automaticamente.</p>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, background: "#fff", padding: 12, border: "1px solid #E6E8EC" }}>
          {error.message}
          {error.digest ? `\nCódigo: ${error.digest}` : ""}
        </pre>
        <button onClick={() => reset()} style={{ marginTop: 12, padding: "8px 14px" }}>
          Tentar de novo
        </button>
      </body>
    </html>
  );
}

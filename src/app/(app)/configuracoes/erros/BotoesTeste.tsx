"use client";
// Botões para provocar um erro de propósito e conferir que ele é registrado.
import Link from "next/link";
import { useRouter } from "next/navigation";

export function BotoesTeste() {
  const router = useRouter();

  function erroNaTela() {
    setTimeout(() => router.refresh(), 1500);
    throw new Error("Erro de teste na tela (botão em Configurações → Erros). Pode marcar como resolvido.");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="hs-botao hs-botao-pequeno" onClick={erroNaTela}>
        Testar erro na tela
      </button>
      <Link href="/configuracoes/erros/teste-servidor" className="hs-botao hs-botao-pequeno">
        Testar erro no servidor
      </Link>
    </div>
  );
}

import Link from "next/link";

// Lembrete para admin e sócio que ainda não ativaram o segundo fator.
export function AvisoSegundoFator() {
  return (
    <div className="hs-aviso-faixa" role="status">
      Proteja sua conta: ative o código do aplicativo autenticador em{" "}
      <Link href="/configuracoes#seguranca" className="underline font-medium">
        Configurações → Segurança
      </Link>
      .
    </div>
  );
}

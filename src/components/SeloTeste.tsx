// Selo "TESTE": aparece só quando NEXT_PUBLIC_AMBIENTE = teste.
export function SeloTeste({ className = "" }: { className?: string }) {
  if (process.env.NEXT_PUBLIC_AMBIENTE !== "teste") return null;
  return (
    <span className={`hs-selo-teste ${className}`} title="Ambiente de teste — não é o programa oficial">
      TESTE
    </span>
  );
}

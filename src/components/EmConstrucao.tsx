// Bloco "em construção" das páginas que ainda não têm conteúdo.
export function EmConstrucao({ texto = "Esta página ainda está em construção." }: { texto?: string }) {
  return (
    <div className="hs-em-construcao">
      <p className="font-medium">Em construção</p>
      <p className="mt-1 text-sm">{texto}</p>
    </div>
  );
}

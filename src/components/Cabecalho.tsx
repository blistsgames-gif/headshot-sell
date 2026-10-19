// Cabeçalho padrão das páginas.
export function Cabecalho({
  titulo,
  subtitulo,
  somenteLeitura = false,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  somenteLeitura?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="hs-cabecalho">
      <div className="min-w-0">
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {somenteLeitura && <span className="hs-etiqueta">Somente leitura</span>}
        {children}
      </div>
    </div>
  );
}

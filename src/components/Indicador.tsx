// Indicador: no Moderno é um número grande sem caixa; no Retrô vira visor de LCD num group box.
export type Tom = "neutro" | "positivo" | "atencao" | "alerta";

export function Indicador({
  rotulo,
  valor,
  detalhe,
  tom = "neutro",
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  tom?: Tom;
}) {
  return (
    <fieldset className="hs-indicador">
      <legend>{rotulo}</legend>
      <div className="hs-indicador-valor">{valor}</div>
      {detalhe && <div className={`hs-indicador-detalhe ${tom !== "neutro" ? `hs-tom-${tom}` : ""}`}>{detalhe}</div>}
    </fieldset>
  );
}

import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { EmConstrucao } from "@/components/EmConstrucao";
import { exigirPagina } from "@/lib/sessao";

export const metadata: Metadata = { title: "Representantes" };

export default async function Pagina() {
  const { podeAlterar } = await exigirPagina("representantes");
  return (
    <>
      <Cabecalho titulo="Representantes" somenteLeitura={!podeAlterar} />
      <EmConstrucao texto="Desempenho e nota de cada representante chegam na Etapa 2." />
    </>
  );
}

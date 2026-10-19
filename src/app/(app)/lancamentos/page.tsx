import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { EmConstrucao } from "@/components/EmConstrucao";
import { exigirPagina } from "@/lib/sessao";

export const metadata: Metadata = { title: "Lançamentos" };

export default async function Pagina() {
  const { podeAlterar } = await exigirPagina("lancamentos");
  return (
    <>
      <Cabecalho titulo="Lançamentos" somenteLeitura={!podeAlterar} />
      <EmConstrucao texto="Lançamentos e campanhas chegam na Etapa 8." />
    </>
  );
}

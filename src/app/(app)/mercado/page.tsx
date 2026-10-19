import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { EmConstrucao } from "@/components/EmConstrucao";
import { exigirPagina } from "@/lib/sessao";

export const metadata: Metadata = { title: "Mercado" };

export default async function Pagina() {
  const { podeAlterar } = await exigirPagina("mercado");
  return (
    <>
      <Cabecalho titulo="Mercado" somenteLeitura={!podeAlterar} />
      <EmConstrucao texto="O Radar de mercado chega na Etapa 7." />
    </>
  );
}

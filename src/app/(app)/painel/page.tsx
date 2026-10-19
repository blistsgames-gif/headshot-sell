import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { EmConstrucao } from "@/components/EmConstrucao";
import { exigirPagina } from "@/lib/sessao";

export const metadata: Metadata = { title: "Painel" };

export default async function Pagina() {
  const { podeAlterar } = await exigirPagina("painel");
  return (
    <>
      <Cabecalho titulo="Painel" somenteLeitura={!podeAlterar} />
      <EmConstrucao texto="Vendas do mês e do ano, curvas ABC e saúde da carteira chegam na Etapa 2." />
    </>
  );
}

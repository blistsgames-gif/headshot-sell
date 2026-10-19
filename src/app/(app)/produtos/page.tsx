import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { EmConstrucao } from "@/components/EmConstrucao";
import { exigirPagina } from "@/lib/sessao";

export const metadata: Metadata = { title: "Produtos" };

export default async function Pagina() {
  const { podeAlterar } = await exigirPagina("produtos");
  return (
    <>
      <Cabecalho titulo="Produtos" somenteLeitura={!podeAlterar} />
      <EmConstrucao texto="Catálogo único MDM e classificação dos itens chegam na Etapa 1." />
    </>
  );
}

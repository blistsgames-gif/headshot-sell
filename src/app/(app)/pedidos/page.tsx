import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { EmConstrucao } from "@/components/EmConstrucao";
import { exigirPagina } from "@/lib/sessao";

export const metadata: Metadata = { title: "Pedidos" };

export default async function Pagina() {
  const { podeAlterar } = await exigirPagina("pedidos");
  return (
    <>
      <Cabecalho titulo="Pedidos" somenteLeitura={!podeAlterar} />
      <EmConstrucao texto="Leitor de pedidos e espelho em PDF chegam na Etapa 4." />
    </>
  );
}

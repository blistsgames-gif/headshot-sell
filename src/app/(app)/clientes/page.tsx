import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { EmConstrucao } from "@/components/EmConstrucao";
import { exigirPagina } from "@/lib/sessao";

export const metadata: Metadata = { title: "Clientes" };

export default async function Pagina() {
  const { podeAlterar } = await exigirPagina("clientes");
  return (
    <>
      <Cabecalho titulo="Clientes" somenteLeitura={!podeAlterar} />
      <EmConstrucao texto="Ficha do cliente, status de recompra e detector de item perdido chegam na Etapa 2." />
    </>
  );
}

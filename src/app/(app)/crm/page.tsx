import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { EmConstrucao } from "@/components/EmConstrucao";
import { exigirPagina } from "@/lib/sessao";

export const metadata: Metadata = { title: "CRM" };

export default async function Pagina() {
  const { podeAlterar } = await exigirPagina("crm");
  return (
    <>
      <Cabecalho titulo="CRM" somenteLeitura={!podeAlterar} />
      <EmConstrucao texto="O funil de novos clientes chega na Etapa 7." />
    </>
  );
}

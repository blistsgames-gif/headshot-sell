import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { EmConstrucao } from "@/components/EmConstrucao";
import { exigirPagina } from "@/lib/sessao";

export const metadata: Metadata = { title: "Radar de peças" };

export default async function Pagina() {
  const { podeAlterar } = await exigirPagina("radar-pecas");
  return (
    <>
      <Cabecalho titulo="Radar de peças" somenteLeitura={!podeAlterar} />
      <EmConstrucao texto="O registro de peças pedidas que a linha não tem chega na Etapa 8." />
    </>
  );
}

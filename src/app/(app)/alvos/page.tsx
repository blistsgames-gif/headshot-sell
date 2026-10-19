import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { EmConstrucao } from "@/components/EmConstrucao";
import { Indicador } from "@/components/Indicador";
import { DicaDoDia } from "@/components/DicaDoDia";
import { exigirPagina } from "@/lib/sessao";

export const metadata: Metadata = { title: "Alvos do dia" };

// ATENÇÃO: números FICTÍCIOS, só para ver os dois temas funcionando.
const INDICADORES_FICTICIOS = [
  { rotulo: "Alvos de hoje", valor: "8", detalhe: "Potencial R$ 42.600", tom: "neutro" as const },
  { rotulo: "Vendas do mês", valor: "R$ 184.320", detalhe: "+12% sobre setembro", tom: "positivo" as const },
  { rotulo: "Meta do mês", valor: "61%", detalhe: "Faltam R$ 117.800", tom: "atencao" as const },
  { rotulo: "Clientes em risco", valor: "14", detalhe: "3 novos nesta semana", tom: "alerta" as const },
];

function saudacao() {
  const hora = Number(new Date().toLocaleString("pt-BR", { hour: "2-digit", hour12: false, timeZone: "America/Sao_Paulo" }));
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function PaginaAlvos() {
  const { perfil, podeAlterar } = await exigirPagina("alvos");
  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });
  const primeiroNome = (perfil.nome ?? "").split(" ")[0];

  return (
    <>
      <Cabecalho
        titulo="Alvos do dia"
        subtitulo={`${saudacao()}${primeiroNome ? `, ${primeiroNome}` : ""}. Hoje é ${hoje}.`}
        somenteLeitura={!podeAlterar}
      >
        <span className="hs-etiqueta hs-etiqueta-atencao">Dados fictícios</span>
      </Cabecalho>

      <DicaDoDia texto="Comece pelos 3 alvos de maior potencial. Ligar antes das 10h aumenta a chance de falar com o comprador." />

      <section aria-label="Indicadores (dados fictícios)" className="hs-indicadores">
        {INDICADORES_FICTICIOS.map((i) => (
          <Indicador key={i.rotulo} rotulo={i.rotulo} valor={i.valor} detalhe={i.detalhe} tom={i.tom} />
        ))}
      </section>

      <div className="mt-8">
        <EmConstrucao texto="A lista de alvos priorizada pela IA chega na Etapa 3." />
      </div>
    </>
  );
}

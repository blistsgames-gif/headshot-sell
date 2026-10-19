import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { Indicador } from "@/components/Indicador";
import { exigirAdmin } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";
import { salvarConfigIa } from "@/lib/acoes";

export const metadata: Metadata = { title: "Limite de IA" };

const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function PaginaIa() {
  await exigirAdmin();
  const supabase = await createClient();
  const [configRes, situacaoRes] = await Promise.all([
    supabase.from("config_ia").select("teto_mensal_reais, percentual_alerta, bloquear_ao_atingir_teto").eq("id", 1).single(),
    supabase.rpc("ia_situacao_mes"),
  ]);
  if (configRes.error) throw new Error(`Não consegui ler config_ia: ${configRes.error.message}`);
  if (situacaoRes.error) throw new Error(`Não consegui calcular o gasto do mês: ${situacaoRes.error.message}`);

  const config = configRes.data;
  const situacao = (situacaoRes.data as { gasto_mes: number; percentual_usado: number; em_alerta: boolean; bloqueado: boolean }[])[0];
  const gasto = Number(situacao?.gasto_mes ?? 0);
  const usado = Number(situacao?.percentual_usado ?? 0);

  return (
    <>
      <Cabecalho titulo="Limite de gasto com IA" subtitulo="Teto mensal da Claude API. O programa confere antes de cada uso.">
        <Link href="/configuracoes" className="hs-etiqueta">
          ← Configurações
        </Link>
      </Cabecalho>

      <section className="hs-indicadores mb-8" aria-label="Situação do mês">
        <Indicador rotulo="Gasto no mês" valor={reais(gasto)} detalhe="Ainda sem uso: a IA entra na Etapa 1" />
        <Indicador rotulo="Teto mensal" valor={reais(Number(config.teto_mensal_reais))} />
        <Indicador
          rotulo="Usado do teto"
          valor={`${usado.toLocaleString("pt-BR")}%`}
          detalhe={situacao?.bloqueado ? "Bloqueado: teto atingido" : situacao?.em_alerta ? "Passou do alerta" : "Dentro do limite"}
          tom={situacao?.bloqueado ? "alerta" : situacao?.em_alerta ? "atencao" : "positivo"}
        />
        <Indicador rotulo="Alerta em" valor={`${config.percentual_alerta}%`} />
      </section>

      <form action={salvarConfigIa} className="hs-cartao max-w-md grid gap-4">
        <h2>Ajustar limite</h2>
        <label className="grid gap-1">
          <span className="text-sm">Teto mensal (R$)</span>
          <input name="teto" type="number" min={0} step="0.01" required defaultValue={Number(config.teto_mensal_reais)} className="hs-campo" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Avisar quando chegar a (% do teto)</span>
          <input name="alerta" type="number" min={1} max={100} required defaultValue={config.percentual_alerta} className="hs-campo" />
        </label>
        <div className="field-row flex items-center gap-2">
          <input id="bloquear" name="bloquear" type="checkbox" defaultChecked={config.bloquear_ao_atingir_teto} />
          <label htmlFor="bloquear" className="text-sm">
            Bloquear o uso da IA quando atingir o teto
          </label>
        </div>
        <div>
          <button type="submit" className="hs-botao hs-botao-principal">
            Salvar
          </button>
        </div>
      </form>
    </>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TelaAuth } from "@/components/TelaAuth";
import { obterSessao } from "@/lib/sessao";
import { FormCodigo } from "./FormCodigo";

export const metadata: Metadata = { title: "Código de segurança" };

export default async function PaginaVerificar() {
  const sessao = await obterSessao();
  if (!sessao.logado) redirect("/login");
  if (!sessao.precisaSegundoFator) redirect("/");

  return (
    <TelaAuth titulo="Código de segurança">
      <FormCodigo />
    </TelaAuth>
  );
}

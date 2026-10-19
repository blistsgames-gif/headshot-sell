import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TelaAuth } from "@/components/TelaAuth";
import { obterSessao } from "@/lib/sessao";
import { FormLogin } from "./FormLogin";

export const metadata: Metadata = { title: "Entrar" };

export default async function PaginaLogin() {
  const sessao = await obterSessao();
  if (sessao.logado) redirect(sessao.precisaSegundoFator ? "/login/verificar" : "/");

  return (
    <TelaAuth titulo="Entrar">
      <FormLogin />
    </TelaAuth>
  );
}

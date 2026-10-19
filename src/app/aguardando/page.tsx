import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TelaAuth } from "@/components/TelaAuth";
import { obterSessao } from "@/lib/sessao";
import { sair } from "@/lib/acoes";

export const metadata: Metadata = { title: "Aguardando liberação" };

export default async function PaginaAguardando() {
  const sessao = await obterSessao();
  if (!sessao.logado) redirect("/login");
  if (sessao.precisaSegundoFator) redirect("/login/verificar");
  if (sessao.perfil?.papel && sessao.perfil.ativo) redirect("/");

  const bloqueado = sessao.perfil?.papel && !sessao.perfil.ativo;

  return (
    <TelaAuth titulo={bloqueado ? "Acesso bloqueado" : "Aguardando liberação"}>
      <p className="text-secundario">
        {bloqueado
          ? "O seu acesso está bloqueado. Fale com o administrador."
          : "Seu acesso foi criado, mas ainda está aguardando liberação. Assim que o administrador definir o seu perfil, é só entrar de novo."}
      </p>
      <p className="text-sm text-secundario mt-3">Conta: {sessao.email}</p>
      <form action={sair} className="mt-6">
        <button type="submit" className="hs-botao w-full">
          Sair
        </button>
      </form>
    </TelaAuth>
  );
}

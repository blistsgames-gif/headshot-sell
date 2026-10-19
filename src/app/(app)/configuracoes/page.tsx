import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { exigirPagina } from "@/lib/sessao";
import { NOME_PAPEL } from "@/lib/menu";
import { sair } from "@/lib/acoes";
import { SeletorTema } from "./SeletorTema";
import { SegundoFator } from "./SegundoFator";

export const metadata: Metadata = { title: "Configurações" };

export default async function PaginaConfiguracoes() {
  const acesso = await exigirPagina("configuracoes");
  const ehAdmin = acesso.papel === "admin";
  const exigido = acesso.papel === "admin" || acesso.papel === "socio";

  return (
    <>
      <Cabecalho titulo="Configurações" />

      <div className="grid gap-6 max-w-3xl">
        <section id="aparencia" className="hs-cartao scroll-mt-20">
          <h2>Aparência</h2>
          <p className="text-sm text-secundario mb-4">
            Os dois temas usam as mesmas telas; só muda a aparência. A escolha vale em qualquer aparelho.
          </p>
          <SeletorTema temaAtual={acesso.tema} />
        </section>

        <section id="seguranca" className="hs-cartao scroll-mt-20">
          <h2>Segurança</h2>
          <p className="text-sm text-secundario mb-4">
            Segundo fator: além da senha, um código de 6 números do aplicativo autenticador no celular
            {exigido ? ". Depois de ativado, ele é pedido em todo login." : "."}
          </p>
          <SegundoFator />
        </section>

        {ehAdmin && (
          <section className="hs-cartao">
            <h2>Administração</h2>
            <ul className="mt-3 grid gap-2 text-sm">
              <li>
                <Link href="/configuracoes/erros" className="underline">
                  Erros do sistema
                </Link>{" "}
                <span className="text-secundario">— lista de erros com a mensagem completa.</span>
              </li>
              <li>
                <Link href="/configuracoes/ia" className="underline">
                  Limite de gasto com IA
                </Link>{" "}
                <span className="text-secundario">— teto mensal da Claude API e alerta.</span>
              </li>
            </ul>
          </section>
        )}

        <section className="hs-cartao">
          <h2>Minha conta</h2>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-secundario">Nome</dt>
            <dd>{acesso.perfil.nome || "—"}</dd>
            <dt className="text-secundario">E-mail</dt>
            <dd className="break-all">{acesso.email}</dd>
            <dt className="text-secundario">Perfil</dt>
            <dd>{NOME_PAPEL[acesso.papel]}</dd>
          </dl>
          <form action={sair} className="mt-4">
            <button type="submit" className="hs-botao">
              Sair
            </button>
          </form>
        </section>
      </div>
    </>
  );
}

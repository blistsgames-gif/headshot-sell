import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { exigirAdmin } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";
import { LinhaErro, type RegistroErro } from "./LinhaErro";
import { BotoesTeste } from "./BotoesTeste";

export const metadata: Metadata = { title: "Erros" };

export default async function PaginaErros({ searchParams }: { searchParams: Promise<{ todos?: string }> }) {
  await exigirAdmin();
  const { todos } = await searchParams;
  const verTodos = todos === "1";

  const supabase = await createClient();
  let consulta = supabase
    .from("erros")
    .select("id, criado_em, usuario_email, origem, pagina, mensagem, detalhes, resolvido")
    .order("criado_em", { ascending: false })
    .limit(200);
  if (!verTodos) consulta = consulta.eq("resolvido", false);
  const { data, error } = await consulta;
  if (error) throw new Error(`Não consegui ler a tabela de erros: ${error.message}`);

  const erros = (data ?? []) as RegistroErro[];

  return (
    <>
      <Cabecalho
        titulo="Erros do sistema"
        subtitulo="Todo erro de tela ou de servidor fica registrado aqui, com a mensagem completa."
      >
        <Link href="/configuracoes" className="hs-etiqueta">
          ← Configurações
        </Link>
      </Cabecalho>

      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
        <Link href="/configuracoes/erros" className={verTodos ? "underline" : "font-semibold"}>
          Não resolvidos
        </Link>
        <Link href="/configuracoes/erros?todos=1" className={verTodos ? "font-semibold" : "underline"}>
          Todos (últimos 200)
        </Link>
        <span className="flex-1" />
        <BotoesTeste />
      </div>

      {erros.length === 0 ? (
        <div className="hs-em-construcao">
          <p className="font-medium">Nenhum erro {verTodos ? "registrado" : "pendente"}.</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {erros.map((e) => (
            <LinhaErro key={e.id} erro={e} />
          ))}
        </ul>
      )}
    </>
  );
}

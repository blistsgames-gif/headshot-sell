// Área logada: confere acesso e monta a casca (menu + tema).
import { AppShell } from "@/components/shell/AppShell";
import { exigirAcesso } from "@/lib/sessao";
import { paginasDoPapel } from "@/lib/menu";
import { createClient } from "@/lib/supabase/server";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const acesso = await exigirAcesso();

  let errosAbertos = 0;
  if (acesso.papel === "admin") {
    const supabase = await createClient();
    const { count } = await supabase.from("erros").select("id", { count: "exact", head: true }).eq("resolvido", false);
    errosAbertos = count ?? 0;
  }

  // Admin e sócio sem segundo fator recebem um lembrete no topo.
  const avisoSegundoFator = (acesso.papel === "admin" || acesso.papel === "socio") && !acesso.segundoFatorAtivo;

  return (
    <AppShell
      tema={acesso.tema}
      mostrarDica={acesso.mostrarDica}
      nome={acesso.perfil.nome ?? ""}
      email={acesso.email}
      papel={acesso.papel}
      paginas={paginasDoPapel(acesso.papel)}
      avisoSegundoFator={avisoSegundoFator}
      errosAbertos={errosAbertos}
    >
      {children}
    </AppShell>
  );
}

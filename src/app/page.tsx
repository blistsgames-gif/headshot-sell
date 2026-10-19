import { redirect } from "next/navigation";
import { exigirAcesso } from "@/lib/sessao";
import { paginaInicial } from "@/lib/menu";

// Página raiz: manda cada um para a sua página inicial.
export default async function Inicio() {
  const acesso = await exigirAcesso();
  redirect(paginaInicial(acesso.papel));
}

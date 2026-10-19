import { exigirAdmin } from "@/lib/sessao";

// Página que falha de propósito, para testar o registro de erros do servidor.
export const dynamic = "force-dynamic";

export default async function TesteErroServidor() {
  await exigirAdmin();
  throw new Error("Erro de teste no servidor (botão em Configurações → Erros). Pode marcar como resolvido.");
}

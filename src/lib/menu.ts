// Páginas do programa e quem pode ver cada uma.
export type Papel = "admin" | "socio" | "representante";
export type Tema = "moderno" | "retro";

export type Pagina = {
  chave: string;
  rotulo: string;
  href: string;
  papeis: Papel[];
  atalho?: string;
};

const TODOS: Papel[] = ["admin", "socio", "representante"];

export const PAGINAS: Pagina[] = [
  { chave: "alvos", rotulo: "Alvos do dia", href: "/alvos", papeis: ["admin", "representante"], atalho: "F3" },
  { chave: "painel", rotulo: "Painel", href: "/painel", papeis: ["admin", "socio"] },
  { chave: "clientes", rotulo: "Clientes", href: "/clientes", papeis: TODOS },
  { chave: "produtos", rotulo: "Produtos", href: "/produtos", papeis: ["admin", "socio"] },
  { chave: "representantes", rotulo: "Representantes", href: "/representantes", papeis: ["admin", "socio"] },
  { chave: "mercado", rotulo: "Mercado", href: "/mercado", papeis: ["admin"] },
  { chave: "crm", rotulo: "CRM", href: "/crm", papeis: ["admin"] },
  { chave: "pedidos", rotulo: "Pedidos", href: "/pedidos", papeis: ["admin"] },
  { chave: "lancamentos", rotulo: "Lançamentos", href: "/lancamentos", papeis: ["admin"] },
  { chave: "radar-pecas", rotulo: "Radar de peças", href: "/radar-pecas", papeis: ["admin", "representante"] },
  // Configurações é para todos (Aparência e Segurança). Erros e IA só o admin.
  { chave: "configuracoes", rotulo: "Configurações", href: "/configuracoes", papeis: TODOS },
];

export const NOME_PAPEL: Record<Papel, string> = {
  admin: "Administrador",
  socio: "Sócio",
  representante: "Representante",
};

export function paginasDoPapel(papel: Papel) {
  return PAGINAS.filter((p) => p.papeis.includes(papel));
}

export function podeVer(papel: Papel, chave: string) {
  return PAGINAS.some((p) => p.chave === chave && p.papeis.includes(papel));
}

/** Sócio só lê: nunca vê botões de alterar. */
export function podeAlterar(papel: Papel) {
  return papel !== "socio";
}

export function paginaInicial(papel: Papel) {
  return papel === "socio" ? "/painel" : "/alvos";
}

export function paginaPorCaminho(caminho: string) {
  return PAGINAS.find((p) => caminho === p.href || caminho.startsWith(p.href + "/"));
}

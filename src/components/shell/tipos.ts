import type { Pagina, Papel, Tema } from "@/lib/menu";

export type PropsShell = {
  tema: Tema;
  mostrarDica: boolean;
  nome: string;
  email: string;
  papel: Papel;
  paginas: Pagina[];
  avisoSegundoFator: boolean;
  errosAbertos: number;
  children: React.ReactNode;
};

export type PropsCasca = PropsShell & {
  caminho: string;
  gaveta: boolean;
  setGaveta: (aberta: boolean) => void;
};

export function estaAtiva(caminho: string, href: string) {
  return caminho === href || caminho.startsWith(href + "/");
}

// Ícones simples (desenhados em SVG) usados nos dois temas.
const CAMINHOS: Record<string, React.ReactNode> = {
  alvos: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </>
  ),
  painel: <path d="M4 20V11M10 20V4M16 20v-7M2 20h20" />,
  clientes: (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7M22 21v-1a6 6 0 0 0-4-5.6" />
    </>
  ),
  produtos: <path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" />,
  representantes: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  mercado: <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />,
  crm: <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />,
  pedidos: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h4" />
    </>
  ),
  lancamentos: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  "radar-pecas": (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 12l6.5-6.5" />
    </>
  ),
  configuracoes: (
    <>
      <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  fechar: <path d="M6 6l12 12M18 6L6 18" />,
  sair: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
  busca: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
};

export function Icone({ nome, tamanho = 18, className = "" }: { nome: string; tamanho?: number; className?: string }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {CAMINHOS[nome] ?? CAMINHOS.pedidos}
    </svg>
  );
}

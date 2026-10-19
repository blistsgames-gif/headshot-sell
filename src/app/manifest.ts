import type { MetadataRoute } from "next";

// PWA: permite instalar o HeadShot Sell como programa (janela própria).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HeadShot Sell",
    short_name: "HSell",
    description: "Ferramenta de vendas, BI, CRM e IA da linha MDM.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F6F7F9",
    theme_color: "#111418",
    icons: [
      { src: "/icones/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icones/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icones/icone-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icones/alvo.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CapturaErros } from "@/components/CapturaErros";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "HeadShot Sell", template: "%s · HeadShot Sell" },
  description: "Ferramenta de vendas, BI, CRM e IA da linha MDM.",
  applicationName: "HeadShot Sell",
  appleWebApp: { capable: true, title: "HSell", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icones/alvo.svg", type: "image/svg+xml" },
      { url: "/icones/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icones/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#111418",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <CapturaErros />
        {children}
      </body>
    </html>
  );
}

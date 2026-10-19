// Moldura simples das telas de entrada (login, código, aguardando).
import { SeloTeste } from "@/components/SeloTeste";

export function TelaAuth({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-fundo text-texto flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icones/alvo.svg" alt="" width={40} height={40} className="rounded-lg" />
            <div>
              <div className="text-lg font-semibold leading-tight">HeadShot Sell</div>
              <div className="text-sm text-secundario">Linha MDM</div>
            </div>
          </div>
          <div className="bg-superficie border border-borda rounded-xl p-6">
            <h1 className="text-xl font-semibold mb-5">{titulo}</h1>
            {children}
          </div>
        </div>
      </main>
      <footer className="px-4 py-4 flex justify-center">
        <SeloTeste />
      </footer>
    </div>
  );
}

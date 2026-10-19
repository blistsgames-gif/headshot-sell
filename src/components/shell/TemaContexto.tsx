"use client";
// Deixa o tema atual disponível para qualquer componente da tela.
import { createContext, useContext } from "react";
import type { Tema } from "@/lib/menu";

export const TemaContexto = createContext<{ tema: Tema; mostrarDica: boolean }>({ tema: "moderno", mostrarDica: true });

export function useTema() {
  return useContext(TemaContexto);
}

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type React from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ProductThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
      enableColorScheme
      enableSystem
    >
      {children}
    </NextThemesProvider>
  );
}

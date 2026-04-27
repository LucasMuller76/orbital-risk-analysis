"use client";
import { SWRConfig } from "swr";
import { LanguageProvider } from "@/lib/language-context";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          dedupingInterval: 30_000,
        }}
      >
        {children}
      </SWRConfig>
    </LanguageProvider>
  );
}

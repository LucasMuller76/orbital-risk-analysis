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
          shouldRetryOnError: false,
          onError: (error) => {
            console.error("[SWR]", error?.message ?? error);
          },
        }}
      >
        {children}
      </SWRConfig>
    </LanguageProvider>
  );
}

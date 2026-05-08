"use client";
import { SWRConfig } from "swr";
import { LanguageProvider } from "@/lib/language-context";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          dedupingInterval: 60_000,
          shouldRetryOnError: true,
          errorRetryCount: 4,
          errorRetryInterval: 8_000,
          onError: process.env.NODE_ENV === "development"
            ? (err) => console.warn("[SWR]", err?.message ?? err)
            : undefined,
        }}
      >
        {children}
      </SWRConfig>
    </LanguageProvider>
  );
}

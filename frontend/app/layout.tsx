import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { SWRProvider } from "@/components/providers";

export const metadata: Metadata = {
  title: "Orbital Risk Dashboard",
  description: "LEO collision risk prediction — ML-powered analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-950 antialiased">
        <SWRProvider>
          <AppShell>
            {children}
          </AppShell>
        </SWRProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
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
      <body className="h-full bg-zinc-50 antialiased">
        <SWRProvider>
          <Sidebar />
          <main className="ml-56 min-h-screen p-8">
            {children}
          </main>
        </SWRProvider>
      </body>
    </html>
  );
}

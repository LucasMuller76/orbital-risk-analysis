import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { SWRProvider } from "@/components/providers";
import { SpaceBackground } from "@/components/SpaceBackground";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

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
    <html lang="en" className={`h-full ${spaceGrotesk.variable}`}>
      <body className="h-full bg-[#020617] antialiased">
        <SpaceBackground />
        <SWRProvider>
          <AppShell>
            {children}
          </AppShell>
        </SWRProvider>
      </body>
    </html>
  );
}

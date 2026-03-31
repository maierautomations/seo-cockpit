import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Lexend } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthSessionProvider } from "@/components/gsc/session-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SEO Cockpit",
  description:
    "KI-gestütztes Optimierungstool für Finanzredaktionen. GSC-Daten analysieren, Artikel priorisieren, KI-Vorschläge erhalten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${lexend.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-signal/30 selection:text-foreground">
        <AuthSessionProvider>
          <TooltipProvider delayDuration={300}>
            {children}
          </TooltipProvider>
        </AuthSessionProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}

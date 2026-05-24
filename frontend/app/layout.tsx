import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProofPack AI — Verifiable AI Data Room on Sui + Walrus",
  description:
    "Decentralized, hash-anchored, AI-explainable evidence packs. Built on Sui with Walrus storage and Tatum RPC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
            {children}
          </main>
          <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--muted)]">
            ProofPack AI — Sui + Walrus + Tatum. Hackathon build.
          </footer>
        </Providers>
      </body>
    </html>
  );
}

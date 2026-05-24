import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { LenisProvider } from "@/components/landing/providers/lenis-provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProofPack AI — Verifiable AI Data Room on Sui + Walrus",
  description:
    "Decentralized, hash-anchored, AI-explainable evidence packs. Built on Sui with Walrus storage and Tatum RPC.",
};

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="relative min-h-screen flex flex-col overflow-x-hidden">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 bg-noise opacity-[0.05] mix-blend-overlay"
        />
        <Providers>
          <LenisProvider>
            <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
          </LenisProvider>
        </Providers>
      </body>
    </html>
  );
}

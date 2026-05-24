"use client";

import "@mysten/dapp-kit/dist/index.css";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";

const TATUM_URL =
  process.env.NEXT_PUBLIC_TATUM_SUI_RPC_URL ??
  "https://sui-testnet.gateway.tatum.io";
const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet") as
  | "mainnet"
  | "testnet"
  | "devnet";

const networks = {
  mainnet: { url: NETWORK === "mainnet" ? TATUM_URL : "https://sui-mainnet.gateway.tatum.io" },
  testnet: { url: NETWORK === "testnet" ? TATUM_URL : "https://sui-testnet.gateway.tatum.io" },
  devnet: { url: NETWORK === "devnet" ? TATUM_URL : "https://sui-devnet.gateway.tatum.io" },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const qc = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={qc}>
      <SuiClientProvider networks={networks} defaultNetwork={NETWORK}>
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

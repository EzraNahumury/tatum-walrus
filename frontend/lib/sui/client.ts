import { SuiClient, SuiHTTPTransport } from "@mysten/sui/client";
import { env } from "../env";

let cached: SuiClient | null = null;

/**
 * Server-side Sui client routed through Tatum's Sui RPC gateway.
 * Attaches `x-api-key` when TATUM_API_KEY is set so RPC usage is attributed
 * to the Tatum account (counts toward "Best Use of Tatum Tools").
 * Reads still succeed without a key on Tatum's free tier.
 */
export function getSuiClient(): SuiClient {
  if (cached) return cached;
  const headers: Record<string, string> = {};
  if (env.tatumApiKey) headers["x-api-key"] = env.tatumApiKey;
  cached = new SuiClient({
    transport: new SuiHTTPTransport({
      url: env.tatumSuiRpcUrl,
      rpc: { headers },
    }),
  });
  return cached;
}

export function explorerObjectUrl(objectId: string): string {
  const net = env.suiNetwork;
  return `https://suiscan.xyz/${net}/object/${objectId}`;
}

export function explorerTxUrl(digest: string): string {
  const net = env.suiNetwork;
  return `https://suiscan.xyz/${net}/tx/${digest}`;
}

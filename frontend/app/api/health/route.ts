import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getSuiClient } from "@/lib/sui/client";

export const runtime = "nodejs";

export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // Tatum Sui RPC
  try {
    const client = getSuiClient();
    const chain = await client.getChainIdentifier();
    checks.tatumRpc = { ok: true, detail: chain };
  } catch (e) {
    checks.tatumRpc = { ok: false, detail: String(e) };
  }

  // Walrus aggregator reachable
  try {
    const res = await fetch(env.walrusAggregatorUrl, { method: "GET" });
    checks.walrusAggregator = { ok: res.status < 500, detail: `HTTP ${res.status}` };
  } catch (e) {
    checks.walrusAggregator = { ok: false, detail: String(e) };
  }

  // Walrus publisher reachable
  try {
    const res = await fetch(env.walrusPublisherUrl, { method: "GET" });
    checks.walrusPublisher = { ok: res.status < 500, detail: `HTTP ${res.status}` };
  } catch (e) {
    checks.walrusPublisher = { ok: false, detail: String(e) };
  }

  return NextResponse.json({
    network: env.suiNetwork,
    rpc: env.tatumSuiRpcUrl,
    walrusUploadMode: env.walrusUploadMode,
    packageId: env.packageId || null,
    registryId: env.registryId || null,
    aiProvider: env.aiProvider,
    checks,
  });
}

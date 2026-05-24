import { NextRequest, NextResponse } from "next/server";
import { getSuiClient } from "@/lib/sui/client";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const digest = req.nextUrl.searchParams.get("digest");
  if (!digest) {
    return NextResponse.json({ error: "missing digest" }, { status: 400 });
  }
  try {
    const client = getSuiClient();
    const tx = await client.getTransactionBlock({
      digest,
      options: { showEffects: true, showObjectChanges: true, showEvents: true },
    });
    const created = (tx.objectChanges ?? []).find(
      (c) =>
        c.type === "created" &&
        typeof c.objectType === "string" &&
        c.objectType.includes("::proofpack::ProofPack"),
    ) as { objectId?: string } | undefined;
    return NextResponse.json({
      digest,
      objectId: created?.objectId ?? null,
      network: env.suiNetwork,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "SUI_RPC_ERROR", message: String(e) },
      { status: 500 },
    );
  }
}

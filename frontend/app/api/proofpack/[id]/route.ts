import { NextResponse } from "next/server";
import { getSuiClient } from "@/lib/sui/client";
import { parseProofPackObject } from "@/lib/sui/parse";
import { walrusFetchText } from "@/lib/walrus/fetch";
import type { ProofPackManifest } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const client = getSuiClient();
    const obj = await client.getObject({
      id,
      options: { showContent: true, showOwner: true },
    });
    const onChain = parseProofPackObject(obj);
    let manifest: ProofPackManifest | null = null;
    try {
      const text = await walrusFetchText(onChain.manifestBlobId);
      manifest = JSON.parse(text) as ProofPackManifest;
    } catch (e) {
      return NextResponse.json(
        {
          onChain,
          manifest: null,
          error: "WALRUS_FETCH_FAILED",
          message: String(e),
        },
        { status: 200 },
      );
    }
    return NextResponse.json({ onChain, manifest });
  } catch (e) {
    return NextResponse.json(
      { error: "SUI_RPC_ERROR", message: String(e) },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSuiClient } from "@/lib/sui/client";
import { env, requirePackageId } from "@/lib/env";
import { withRpcRetry } from "@/lib/retry";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const owner = req.nextUrl.searchParams.get("owner");
  if (!owner) {
    return NextResponse.json({ error: "missing owner" }, { status: 400 });
  }
  try {
    const pkg = requirePackageId();
    const client = getSuiClient();
    const owned = await withRpcRetry(() =>
      client.getOwnedObjects({
        owner,
        filter: { StructType: `${pkg}::proofpack::ProofPack` },
        options: { showContent: true, showType: true },
      }),
    );
    return NextResponse.json({
      network: env.suiNetwork,
      data: owned.data.map((item) => {
        const f = (item.data?.content as { fields?: Record<string, unknown> } | undefined)?.fields;
        return { objectId: item.data?.objectId, fields: f ?? null };
      }),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "SUI_RPC_ERROR", message: String(e) },
      { status: 500 },
    );
  }
}

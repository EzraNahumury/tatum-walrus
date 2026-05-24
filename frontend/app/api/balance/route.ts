import { NextRequest, NextResponse } from "next/server";
import { getSuiClient } from "@/lib/sui/client";
import { withRpcRetry } from "@/lib/retry";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const owner = req.nextUrl.searchParams.get("owner");
  if (!owner) {
    return NextResponse.json({ error: "missing owner" }, { status: 400 });
  }
  try {
    const client = getSuiClient();
    const balance = await withRpcRetry(() => client.getBalance({ owner }));
    return NextResponse.json({
      owner,
      coinType: balance.coinType,
      totalBalance: balance.totalBalance,
      coinObjectCount: balance.coinObjectCount,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "SUI_RPC_ERROR", message: String(e) },
      { status: 500 },
    );
  }
}

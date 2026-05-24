import { NextRequest, NextResponse } from "next/server";
import { getSuiClient } from "@/lib/sui/client";
import { withRpcRetry } from "@/lib/retry";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Execute a wallet-signed Sui transaction via Tatum RPC.
 *
 * The browser cannot POST sui_executeTransactionBlock directly to the Tatum
 * gateway — Tatum's response omits Access-Control-Allow-Origin, so the
 * browser blocks it as a CORS error. We sign in the wallet, ship the bytes
 * here, and execute server-side with x-api-key for usage attribution.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      transactionBlock?: string;
      signature?: string | string[];
    };
    if (!body.transactionBlock || !body.signature) {
      return NextResponse.json(
        { error: "missing transactionBlock or signature" },
        { status: 400 },
      );
    }

    const client = getSuiClient();
    const result = await withRpcRetry(() =>
      client.executeTransactionBlock({
        transactionBlock: body.transactionBlock!,
        signature: body.signature!,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        },
      }),
    );

    return NextResponse.json({
      digest: result.digest,
      effects: result.effects,
      objectChanges: result.objectChanges,
      events: result.events,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "SUI_EXECUTE_FAILED", message: String(e) },
      { status: 500 },
    );
  }
}

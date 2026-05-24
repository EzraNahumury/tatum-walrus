import { NextResponse } from "next/server";
import { getSuiClient } from "@/lib/sui/client";
import { parseProofPackObject } from "@/lib/sui/parse";
import { walrusFetch, walrusFetchText } from "@/lib/walrus/fetch";
import { walrusUpload } from "@/lib/walrus/upload";
import { sha256Hex } from "@/lib/hash/sha256";
import { env } from "@/lib/env";
import { withRpcRetry } from "@/lib/retry";
import type { Hex, ProofPackManifest, VerificationReport } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const client = getSuiClient();
    const obj = await withRpcRetry(() =>
      client.getObject({
        id,
        options: { showContent: true, showOwner: true },
      }),
    );
    const onChain = parseProofPackObject(obj);

    const manifestText = await walrusFetchText(onChain.manifestBlobId);
    const manifestHashActual = await sha256Hex(manifestText);
    const manifestOk = manifestHashActual === onChain.manifestHash;
    const manifest = JSON.parse(manifestText) as ProofPackManifest;

    const fileChecks: VerificationReport["files"] = [];
    for (const f of manifest.files) {
      try {
        const bytes = await walrusFetch(f.blobId);
        const actual = await sha256Hex(bytes);
        fileChecks.push({
          filename: f.filename,
          blobId: f.blobId,
          expected: f.sha256,
          actual,
          ok: actual === f.sha256,
        });
      } catch (e) {
        fileChecks.push({
          filename: f.filename,
          blobId: f.blobId,
          expected: f.sha256,
          actual: `fetch_error: ${String(e)}`,
          ok: false,
        });
      }
    }

    const valid = manifestOk && fileChecks.every((c) => c.ok);

    const report: VerificationReport = {
      objectId: id as Hex,
      network: env.suiNetwork,
      manifestOk,
      files: fileChecks,
      valid,
      generatedAtMs: Date.now(),
      tatumRpcUrl: env.tatumSuiRpcUrl,
    };

    // Best-effort: anchor the verification report itself to Walrus.
    try {
      const reportBytes = new TextEncoder().encode(JSON.stringify(report));
      const { blobId: reportBlobId } = await walrusUpload(
        reportBytes,
        `verify-${id}.json`,
      );
      report.reportBlobId = reportBlobId;
    } catch {
      // non-fatal
    }

    return NextResponse.json({ onChain, manifest, report });
  } catch (e) {
    return NextResponse.json(
      { error: "SUI_RPC_ERROR", message: String(e) },
      { status: 500 },
    );
  }
}

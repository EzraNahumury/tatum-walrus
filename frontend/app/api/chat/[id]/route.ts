import { NextRequest, NextResponse } from "next/server";
import { getSuiClient } from "@/lib/sui/client";
import { parseProofPackObject } from "@/lib/sui/parse";
import { walrusFetchText } from "@/lib/walrus/fetch";
import { answerQuestion } from "@/lib/ai";
import { withRpcRetry } from "@/lib/retry";
import type { ProofPackManifest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const TEXTY = /\.(md|markdown|txt|json|csv|log|yaml|yml)$/i;

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as { question?: string };
    const question = body.question?.trim();
    if (!question) {
      return NextResponse.json({ error: "missing question" }, { status: 400 });
    }

    const client = getSuiClient();
    const obj = await withRpcRetry(() =>
      client.getObject({
        id,
        options: { showContent: true, showOwner: true },
      }),
    );
    const onChain = parseProofPackObject(obj);

    const manifestText = await walrusFetchText(onChain.manifestBlobId);
    const manifest = JSON.parse(manifestText) as ProofPackManifest;

    const contextSnippets: Array<{
      filename: string;
      blobId: string;
      sha256: string;
      text: string;
    }> = [
      {
        filename: "manifest.json",
        blobId: onChain.manifestBlobId,
        sha256: onChain.manifestHash,
        text: manifestText,
      },
    ];

    for (const f of manifest.files) {
      if (!TEXTY.test(f.filename) && !f.contentType.startsWith("text/")) continue;
      try {
        const text = await walrusFetchText(f.blobId);
        contextSnippets.push({
          filename: f.filename,
          blobId: f.blobId,
          sha256: f.sha256,
          text,
        });
      } catch {
        // skip unreadable blobs
      }
    }

    const answer = await answerQuestion({
      question,
      pack: { onChain, manifest },
      contextSnippets,
    });
    return NextResponse.json(answer);
  } catch (e) {
    return NextResponse.json(
      { error: "CHAT_FAILED", message: String(e) },
      { status: 500 },
    );
  }
}

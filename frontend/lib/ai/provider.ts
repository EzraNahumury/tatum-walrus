import type { AIAnswer, AICitation, ProofPackFull } from "../types";

export interface AIProvider {
  name: string;
  answer(input: AskInput): Promise<AIAnswer>;
}

export interface AskInput {
  question: string;
  pack: ProofPackFull;
  contextSnippets: Array<{ filename: string; blobId: string; sha256: string; text: string }>;
}

export const NOT_FOUND_MESSAGE = "Not found in this ProofPack.";

/**
 * Build the strict system prompt that forces grounded answers.
 */
export function buildSystemPrompt(pack: ProofPackFull): string {
  return `You are ProofPack AI. You only answer questions using the supplied ProofPack context.

Rules:
- ProofPack objectId: ${pack.onChain.objectId}
- Owner: ${pack.onChain.owner}
- Network: ${pack.onChain.visibility} | version ${pack.onChain.version}
- For every factual claim, include a citation referencing exactly one file from the context list (blobId + sha256).
- If the answer is not present in the supplied context, reply exactly: "${NOT_FOUND_MESSAGE}"
- Never invent file names, blobIds, or sha256 values. Only use the ones provided.
- Output JSON only, no prose outside JSON. Shape: { "answer": string, "references": [{ "filename": string, "blobId": string, "sha256": string, "snippet": string }] }
- If notFound, references must be []. Otherwise references must list every file you used.`;
}

export function buildUserPrompt(input: AskInput): string {
  const ctx = input.contextSnippets
    .map(
      (s, i) =>
        `--- FILE ${i + 1} ---\nfilename: ${s.filename}\nblobId: ${s.blobId}\nsha256: ${s.sha256}\n<content>\n${s.text.slice(0, 8000)}\n</content>`,
    )
    .join("\n\n");
  return `Context:\n${ctx}\n\nQuestion: ${input.question}`;
}

/**
 * Strip the model's reply down to grounded references the manifest knows about.
 * Drops any citation whose blobId is not in the pack manifest.
 */
export function groundAnswer(
  raw: { answer: string; references?: Array<{ filename?: string; blobId?: string; sha256?: string; snippet?: string }> },
  pack: ProofPackFull,
): AIAnswer {
  const known = new Map(pack.manifest.files.map((f) => [f.blobId, f]));
  const refs: AICitation[] = [];
  for (const r of raw.references ?? []) {
    if (!r.blobId) continue;
    const file = known.get(r.blobId);
    if (!file) continue;
    refs.push({
      filename: file.filename,
      blobId: file.blobId,
      sha256: file.sha256,
      objectId: pack.onChain.objectId,
      snippet: r.snippet,
    });
  }
  const answer = (raw.answer ?? "").trim();
  const notFound = answer === NOT_FOUND_MESSAGE || refs.length === 0;
  return {
    answer: notFound ? NOT_FOUND_MESSAGE : answer,
    references: notFound ? [] : refs,
    notFound,
  };
}

import { env } from "../env";
import {
  AIProvider,
  AskInput,
  buildSystemPrompt,
  buildUserPrompt,
  groundAnswer,
  NOT_FOUND_MESSAGE,
} from "./provider";
import type { AIAnswer } from "../types";

export const claudeProvider: AIProvider = {
  name: "claude",
  async answer(input: AskInput): Promise<AIAnswer> {
    if (!env.aiApiKey) {
      return { answer: NOT_FOUND_MESSAGE, references: [], notFound: true };
    }
    const sys = buildSystemPrompt(input.pack);
    const user = buildUserPrompt(input);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.aiApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: env.aiModel || "claude-opus-4-7",
        max_tokens: 1024,
        system: sys,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Claude error: ${res.status} ${t}`);
    }
    const data = (await res.json()) as {
      content: Array<{ type: string; text?: string }>;
    };
    const text = data.content.find((c) => c.type === "text")?.text ?? "";
    return parseAndGround(text, input);
  },
};

function parseAndGround(text: string, input: AskInput): AIAnswer {
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart < 0 || jsonEnd < 0) {
    return { answer: NOT_FOUND_MESSAGE, references: [], notFound: true };
  }
  try {
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as {
      answer: string;
      references?: Array<{ filename?: string; blobId?: string; sha256?: string; snippet?: string }>;
    };
    return groundAnswer(parsed, input.pack);
  } catch {
    return { answer: NOT_FOUND_MESSAGE, references: [], notFound: true };
  }
}

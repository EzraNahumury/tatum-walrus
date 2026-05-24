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

/**
 * Ollama cloud (or self-hosted) via the OpenAI-compatible /v1 endpoint.
 * Configured by OLLAMA_HOST, OLLAMA_KEY, OLLAMA_MODEL.
 */
export const ollamaProvider: AIProvider = {
  name: "ollama",
  async answer(input: AskInput): Promise<AIAnswer> {
    if (!env.ollamaKey || !env.ollamaModel) {
      return { answer: NOT_FOUND_MESSAGE, references: [], notFound: true };
    }
    const base = env.ollamaHost.replace(/\/$/, "");
    const url = `${base}/v1/chat/completions`;
    const sys = buildSystemPrompt(input.pack);
    const user = buildUserPrompt(input);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.ollamaKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: env.ollamaModel,
        stream: false,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Ollama error: ${res.status} ${t}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end < 0) {
      return { answer: NOT_FOUND_MESSAGE, references: [], notFound: true };
    }
    try {
      const parsed = JSON.parse(text.slice(start, end + 1)) as {
        answer: string;
        references?: Array<{ filename?: string; blobId?: string; sha256?: string; snippet?: string }>;
      };
      return groundAnswer(parsed, input.pack);
    } catch {
      return { answer: NOT_FOUND_MESSAGE, references: [], notFound: true };
    }
  },
};

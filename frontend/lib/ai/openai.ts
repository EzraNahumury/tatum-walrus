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

export const openaiProvider: AIProvider = {
  name: "openai",
  async answer(input: AskInput): Promise<AIAnswer> {
    if (!env.aiApiKey) {
      return { answer: NOT_FOUND_MESSAGE, references: [], notFound: true };
    }
    const sys = buildSystemPrompt(input.pack);
    const user = buildUserPrompt(input);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.aiApiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: env.aiModel || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`OpenAI error: ${res.status} ${t}`);
    }
    const data = (await res.json()) as {
      choices: Array<{ message: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    try {
      const parsed = JSON.parse(text) as {
        answer: string;
        references?: Array<{ filename?: string; blobId?: string; sha256?: string; snippet?: string }>;
      };
      return groundAnswer(parsed, input.pack);
    } catch {
      return { answer: NOT_FOUND_MESSAGE, references: [], notFound: true };
    }
  },
};

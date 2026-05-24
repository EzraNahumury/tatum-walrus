import { env } from "../env";
import type { AIAnswer } from "../types";
import { claudeProvider } from "./claude";
import { mcpProvider } from "./mcp";
import { ollamaProvider } from "./ollama";
import { openaiProvider } from "./openai";
import {
  AIProvider,
  AskInput,
  NOT_FOUND_MESSAGE,
  buildSystemPrompt,
} from "./provider";

export function getActiveProvider(): AIProvider | null {
  switch (env.aiProvider) {
    case "claude":
      return claudeProvider;
    case "openai":
      return openaiProvider;
    case "ollama":
      return ollamaProvider;
    case "mcp":
      return mcpProvider;
    default:
      return null;
  }
}

export async function answerQuestion(input: AskInput): Promise<AIAnswer> {
  const provider = getActiveProvider();
  if (!provider) {
    return {
      answer: `AI provider not configured. ${NOT_FOUND_MESSAGE}`,
      references: [],
      notFound: true,
    };
  }
  return provider.answer(input);
}

export { buildSystemPrompt, NOT_FOUND_MESSAGE };
export type { AIProvider, AskInput };

/**
 * MCP-mode AI provider.
 *
 * Uses Ollama cloud (or self-hosted) as the model runtime and exposes Tatum
 * Sui RPC calls as OpenAI-style tool definitions — equivalent to what the
 * Tatum Blockchain MCP server would do, without the stdio subprocess.
 * The model can call sui_getObject / sui_getBalance / sui_getChainIdentifier
 * mid-answer to ground replies in live on-chain data.
 */

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
import { execTool, tatumSuiTools } from "./tatum-tools";

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
  name?: string;
}

export const mcpProvider: AIProvider = {
  name: "mcp",
  async answer(input: AskInput): Promise<AIAnswer> {
    if (!env.ollamaKey || !env.ollamaModel) {
      return { answer: NOT_FOUND_MESSAGE, references: [], notFound: true };
    }

    const url = `${env.ollamaHost.replace(/\/$/, "")}/v1/chat/completions`;
    const sys =
      buildSystemPrompt(input.pack) +
      `\n\nYou may also call live Tatum Sui RPC tools (sui_getObject, sui_getBalance, sui_getChainIdentifier) to verify on-chain facts before answering. Tool results are authoritative on-chain truth.`;

    const messages: ChatMessage[] = [
      { role: "system", content: sys },
      { role: "user", content: buildUserPrompt(input) },
    ];

    // Loop: model may emit tool_calls; we execute then re-call.
    for (let step = 0; step < 4; step++) {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          authorization: `Bearer ${env.ollamaKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: env.ollamaModel,
          stream: false,
          tools: tatumSuiTools,
          messages,
        }),
      });
      if (!res.ok) throw new Error(`MCP/Ollama error ${res.status}: ${await res.text()}`);
      const data = (await res.json()) as {
        choices?: Array<{ message: ChatMessage; finish_reason?: string }>;
      };
      const msg = data.choices?.[0]?.message;
      if (!msg) return { answer: NOT_FOUND_MESSAGE, references: [], notFound: true };

      // Tool calls? Execute, push results, loop.
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        messages.push(msg);
        for (const call of msg.tool_calls) {
          let result: unknown;
          try {
            const args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
            result = await execTool(call.function.name, args);
          } catch (e) {
            result = { error: String(e) };
          }
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            name: call.function.name,
            content: JSON.stringify(result).slice(0, 4000),
          });
        }
        continue; // re-ask model with tool outputs
      }

      // Final answer
      const text = typeof msg.content === "string" ? msg.content : "";
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
    }

    return { answer: NOT_FOUND_MESSAGE, references: [], notFound: true };
  },
};

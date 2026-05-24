import {
  AIProvider,
  AskInput,
  NOT_FOUND_MESSAGE,
} from "./provider";
import type { AIAnswer } from "../types";

/**
 * Placeholder MCP provider — wires to Tatum Blockchain MCP server when
 * TATUM_MCP_URL is configured. Until the MCP transport is wired in this
 * provider degrades gracefully to "Not found" so the rest of the app is
 * unaffected.
 */
export const mcpProvider: AIProvider = {
  name: "mcp",
  async answer(_input: AskInput): Promise<AIAnswer> {
    return { answer: NOT_FOUND_MESSAGE, references: [], notFound: true };
  },
};

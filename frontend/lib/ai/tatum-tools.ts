/**
 * Tatum RPC tool-calls exposed to the AI (MCP-equivalent).
 *
 * Tatum's Blockchain MCP server is stdio-only via npx, awkward to bridge from
 * a Next.js API route. Tatum MCP wraps the same Tatum Sui RPC gateway we
 * already use, so we expose those calls directly as OpenAI-compatible tool
 * definitions. The model can call them at chat time to ground answers in
 * live on-chain data.
 */

import { env } from "../env";

export interface ToolDef {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export const tatumSuiTools: ToolDef[] = [
  {
    type: "function",
    function: {
      name: "sui_getObject",
      description:
        "Fetch a Sui object by its objectId via the Tatum Sui RPC gateway. Returns the full object payload (content, owner, version).",
      parameters: {
        type: "object",
        properties: {
          objectId: {
            type: "string",
            description: "Sui object ID, e.g. 0xabc…",
          },
        },
        required: ["objectId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "sui_getBalance",
      description:
        "Get the SUI balance for a Sui address via the Tatum Sui RPC gateway.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "Sui address, e.g. 0xabc…",
          },
        },
        required: ["address"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "sui_getChainIdentifier",
      description:
        "Return the Sui chain identifier (proves which network we are connected to via Tatum).",
      parameters: { type: "object", properties: {} },
    },
  },
];

async function tatumRpc(method: string, params: unknown[]): Promise<unknown> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (env.tatumApiKey) headers["x-api-key"] = env.tatumApiKey;
  const res = await fetch(env.tatumSuiRpcUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`Tatum RPC ${method}: ${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: unknown };
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}

export async function execTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "sui_getObject":
      return tatumRpc("sui_getObject", [
        String(args.objectId),
        { showType: true, showContent: true, showOwner: true },
      ]);
    case "sui_getBalance":
      return tatumRpc("suix_getBalance", [String(args.address)]);
    case "sui_getChainIdentifier":
      return tatumRpc("sui_getChainIdentifier", []);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

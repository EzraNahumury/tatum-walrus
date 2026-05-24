import type { SuiNetwork } from "./types";

function need(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  // Server
  tatumApiKey: process.env.TATUM_API_KEY ?? "",
  walrusUploadMode: (process.env.WALRUS_UPLOAD_MODE ?? "walrus_publisher") as
    | "tatum_storage_api"
    | "walrus_publisher",
  walrusPublisherUrl:
    process.env.WALRUS_PUBLISHER_URL ?? "https://publisher.walrus-testnet.walrus.space",
  walrusAggregatorUrl:
    process.env.WALRUS_AGGREGATOR_URL ?? "https://aggregator.walrus-testnet.walrus.space",
  walrusDefaultEpochs: Number(process.env.WALRUS_DEFAULT_EPOCHS ?? "5"),

  // AI
  aiProvider: (process.env.AI_PROVIDER ?? "none") as
    | "claude"
    | "openai"
    | "mcp"
    | "ollama"
    | "none",
  aiApiKey: process.env.AI_API_KEY ?? "",
  aiModel: process.env.AI_MODEL ?? "",
  tatumMcpUrl: process.env.TATUM_MCP_URL ?? "",

  // Ollama (cloud or self-hosted, OpenAI-compatible)
  ollamaHost: process.env.OLLAMA_HOST ?? "https://ollama.com",
  ollamaKey: process.env.OLLAMA_KEY ?? "",
  ollamaModel: process.env.OLLAMA_MODEL ?? "",

  // Public (also read from NEXT_PUBLIC_* on the client)
  suiNetwork: (process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet") as SuiNetwork,
  tatumSuiRpcUrl:
    process.env.NEXT_PUBLIC_TATUM_SUI_RPC_URL ?? "https://sui-testnet.gateway.tatum.io",
  packageId: process.env.NEXT_PUBLIC_PACKAGE_ID ?? "",
  registryId: process.env.NEXT_PUBLIC_PROOFPACK_REGISTRY_ID ?? "",
};

export function requireTatumKey(): string {
  return need("TATUM_API_KEY", env.tatumApiKey);
}

export function requirePackageId(): string {
  return need("NEXT_PUBLIC_PACKAGE_ID", env.packageId);
}

export function requireRegistryId(): string {
  return need("NEXT_PUBLIC_PROOFPACK_REGISTRY_ID", env.registryId);
}

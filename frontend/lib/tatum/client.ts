import { env, requireTatumKey } from "../env";

const TATUM_API_BASE = "https://api.tatum.io";

export async function tatumFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("x-api-key", requireTatumKey());
  return fetch(`${TATUM_API_BASE}${path}`, { ...init, headers });
}

export function tatumSuiRpcUrl(): string {
  return env.tatumSuiRpcUrl;
}

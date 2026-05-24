/**
 * Retry a promise-returning fn on Tatum 429 with exponential backoff.
 * Re-throws non-429 errors immediately.
 */
export async function withRpcRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const status = (e as { status?: number; statusCode?: number }).status
        ?? (e as { statusCode?: number }).statusCode;
      const msg = String(e);
      const isRateLimited = status === 429 || /429|Too Many Requests/i.test(msg);
      if (!isRateLimited) throw e;
      if (i === tries - 1) break;
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
  throw lastErr;
}

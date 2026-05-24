"use client";

import { AlertCircle } from "lucide-react";

interface Props {
  title?: string;
  message: string;
  hint?: string;
  action?: { label: string; onClick: () => void };
}

const HINTS: Array<{ match: RegExp; hint: string }> = [
  { match: /TATUM_API_KEY/i, hint: "Add TATUM_API_KEY to frontend/.env.local — grab one at dashboard.tatum.io." },
  { match: /PACKAGE_ID/i, hint: "Publish the Move package and paste packageId + registry id into .env.local." },
  { match: /429|Too Many Requests/i, hint: "Tatum free tier rate-limited the request — wait a few seconds and retry." },
  { match: /WALRUS_FETCH_FAILED|blob/i, hint: "Walrus blob may have expired. Re-seed the demo to refresh epochs." },
  { match: /HASH_MISMATCH|mismatch/i, hint: "The bytes on Walrus do not match the on-chain hash. Pack was tampered with." },
  { match: /SUI_RPC_ERROR/i, hint: "Tatum Sui RPC gateway returned an error. Check NEXT_PUBLIC_TATUM_SUI_RPC_URL." },
  { match: /Failed to fetch/i, hint: "Browser could not reach the API route. Is the dev server running?" },
];

export function ErrorPanel({ title = "Something went wrong", message, hint, action }: Props) {
  const derived = hint ?? HINTS.find((h) => h.match.test(message))?.hint;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-danger)]/30 bg-[rgba(255,107,107,0.05)] p-5">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(255,107,107,0.25), transparent 70%)" }}
      />
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-[var(--color-danger)]/40 bg-bg/40 text-[var(--color-danger)]">
          <AlertCircle className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fg">{title}</p>
          <p className="mt-1 break-words text-xs text-fg-muted">{message}</p>
          {derived && (
            <p className="mt-3 rounded-xl border border-[var(--color-danger)]/20 bg-bg/40 px-3 py-2 text-[11px] text-fg-muted">
              <strong className="text-fg">Try this: </strong>
              {derived}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-3 inline-flex items-center rounded-full border border-[var(--color-danger)]/40 px-3 py-1.5 text-[11px] uppercase tracking-wider text-fg-muted hover:bg-white/[0.04] hover:text-fg"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

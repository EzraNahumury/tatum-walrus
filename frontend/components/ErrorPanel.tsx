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
];

export function ErrorPanel({ title = "Something went wrong", message, hint, action }: Props) {
  const derived = hint ?? HINTS.find((h) => h.match.test(message))?.hint;
  return (
    <div className="border border-[var(--danger)]/40 bg-[var(--danger)]/5 rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[var(--danger)] font-semibold">{title}</span>
      </div>
      <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
      {derived && (
        <p className="text-xs text-[var(--muted)] border-t border-[var(--danger)]/30 pt-2">
          <strong>Try this: </strong>
          {derived}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 text-xs px-3 py-1.5 rounded-md border border-[var(--danger)]/50 hover:bg-[var(--danger)]/10"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export function VerifyBadge({ valid }: { valid: boolean | null }) {
  if (valid === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface/60 px-3 py-1.5 text-xs uppercase tracking-wider text-fg-muted">
        <Loader2 className="size-3 animate-spin" /> Verifying
      </span>
    );
  }
  if (valid) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(108,242,204,0.12)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-emerald)]">
        <CheckCircle2 className="size-3" /> Valid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,107,107,0.12)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-danger)]">
      <XCircle className="size-3" /> Invalid
    </span>
  );
}

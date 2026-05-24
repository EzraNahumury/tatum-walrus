export function VerifyBadge({ valid }: { valid: boolean | null }) {
  if (valid === null) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--border)]/40 text-sm">
        Verifying…
      </span>
    );
  }
  if (valid) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] font-semibold text-sm">
        VALID
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--danger)]/15 text-[var(--danger)] font-semibold text-sm">
      INVALID
    </span>
  );
}

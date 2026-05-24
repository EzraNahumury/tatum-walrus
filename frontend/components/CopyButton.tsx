"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  value,
  size = "sm",
  label,
}: {
  value: string;
  size?: "sm" | "xs";
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const icon = size === "xs" ? "size-3" : "size-3.5";
  const box = size === "xs" ? "size-5" : "size-7";

  async function copy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // noop
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label ?? "value"}`}
      title={copied ? "Copied" : "Copy"}
      className={`inline-grid ${box} place-items-center rounded-md border border-border bg-bg/40 text-fg-dim transition-all hover:border-border-strong hover:text-fg active:scale-95`}
    >
      {copied ? <Check className={`${icon} text-[var(--color-emerald)]`} /> : <Copy className={icon} />}
    </button>
  );
}

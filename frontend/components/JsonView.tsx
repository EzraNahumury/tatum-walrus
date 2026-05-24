"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * VS Code-ish JSON viewer with copy + line numbers.
 * Tokenizer is regex-based — fine for trusted JSON payloads (our verify report).
 */
export function JsonView({
  data,
  maxHeight = "28rem",
  filename,
}: {
  data: unknown;
  maxHeight?: string;
  filename?: string;
}) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(data, null, 2);
  const lines = text.split("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border-strong bg-[#0d1117] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between border-b border-border/60 bg-black/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[11px] text-fg-dim">
            {filename ?? "report.json"}
          </span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white/[0.04] px-2 py-1 text-[11px] text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
          aria-label="Copy JSON"
        >
          {copied ? (
            <>
              <Check className="size-3 text-[var(--color-emerald)]" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3" /> Copy
            </>
          )}
        </button>
      </div>
      <div className="overflow-auto font-mono text-[12px] leading-[1.55]" style={{ maxHeight }}>
        <pre className="grid grid-cols-[auto_1fr] gap-x-3 px-4 py-3">
          {lines.map((line, i) => (
            <span key={i} className="contents">
              <span className="select-none pr-1 text-right text-[#444c56] tabular">
                {i + 1}
              </span>
              <span className="whitespace-pre">
                <HighlightedLine raw={line} />
              </span>
            </span>
          ))}
        </pre>
      </div>
    </div>
  );
}

const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|([{}\[\],])/g;

function HighlightedLine({ raw }: { raw: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  raw.replace(TOKEN, (match, str: string | undefined, colon: string | undefined, kw: string | undefined, punct: string | undefined, offset: number) => {
    if (offset > last) parts.push(<span key={key++}>{raw.slice(last, offset)}</span>);

    if (str !== undefined) {
      // string or key: colon following = key
      const isKey = !!colon;
      parts.push(
        <span key={key++} className={isKey ? "text-[#7ee787]" : "text-[#a5d6ff]"}>
          {str}
        </span>,
      );
      if (colon) parts.push(<span key={key++} className="text-fg-dim">{colon}</span>);
    } else if (kw !== undefined) {
      parts.push(
        <span key={key++} className={kw === "null" ? "text-[#ff7b72]" : "text-[#d2a8ff]"}>
          {match}
        </span>,
      );
    } else if (punct !== undefined) {
      parts.push(
        <span key={key++} className="text-fg-dim">
          {match}
        </span>,
      );
    } else {
      // number
      parts.push(
        <span key={key++} className="text-[#ffa657]">
          {match}
        </span>,
      );
    }
    last = offset + match.length;
    return match;
  });
  if (last < raw.length) parts.push(<span key={key++}>{raw.slice(last)}</span>);
  return <>{parts}</>;
}

"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { CitationChip } from "./CitationChip";
import { LoadingLogo } from "./LoadingLogo";
import type { AIAnswer } from "@/lib/types";

interface Turn {
  q: string;
  a: AIAnswer | null;
  err?: string;
}

export function ChatPanel({ objectId }: { objectId: string }) {
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);

  async function ask() {
    const q = question.trim();
    if (!q || busy) return;
    setBusy(true);
    setTurns((t) => [...t, { q, a: null }]);
    setQuestion("");
    try {
      const res = await fetch(`/api/chat/${objectId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = (await res.json()) as AIAnswer & { error?: string; message?: string };
      setTurns((t) => {
        const next = [...t];
        const last = next[next.length - 1];
        if (data.error) last.err = data.message || data.error;
        else last.a = data;
        return next;
      });
    } catch (e) {
      setTurns((t) => {
        const next = [...t];
        next[next.length - 1].err = String(e);
        return next;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-5">
      <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-fg-dim">
        <Sparkles className="size-3" /> Grounded assistant
      </div>

      {turns.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-bg/30 px-4 py-6 text-center text-sm text-fg-muted">
          Ask anything about this pack. Every answer cites the source blobId + sha256, or says
          <span className="font-medium text-fg"> &quot;Not found in this ProofPack.&quot;</span>
        </p>
      ) : (
        <ul className="space-y-4">
          {turns.map((t, i) => (
            <li key={i} className="space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-[rgba(145,129,245,0.16)] px-3.5 py-2 text-sm text-fg">
                  {t.q}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-border bg-bg/40 px-3.5 py-2.5 text-sm">
                  {t.err ? (
                    <span className="text-[var(--color-danger)]">{t.err}</span>
                  ) : t.a ? (
                    <div className="space-y-2.5">
                      <p className="whitespace-pre-wrap text-fg">{t.a.answer}</p>
                      {t.a.references.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {t.a.references.map((r, j) => (
                            <CitationChip key={j} ref={r} />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <LoadingLogo label="Thinking…" />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border-strong bg-bg/50 p-1.5">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="What is inside this pack?"
          className="w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-fg-dim"
        />
        <button
          onClick={ask}
          disabled={busy || !question.trim()}
          className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[0_-4px_8px_rgba(255,255,255,0.25)_inset] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          style={{ background: "var(--gradient-brand)" }}
        >
          <Send className="size-3.5" />
          Ask
        </button>
      </div>
    </section>
  );
}

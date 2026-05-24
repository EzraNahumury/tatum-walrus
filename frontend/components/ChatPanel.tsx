"use client";

import { useState } from "react";
import { CitationChip } from "./CitationChip";
import { Spinner } from "./Spinner";
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
    <div className="border border-[var(--border)] rounded-lg p-4 space-y-4">
      <h3 className="font-semibold">Ask AI about this pack</h3>
      <div className="space-y-3">
        {turns.map((t, i) => (
          <div key={i} className="space-y-2">
            <div className="text-sm"><span className="text-[var(--muted)]">You:</span> {t.q}</div>
            {t.err ? (
              <div className="text-sm text-[var(--danger)]">{t.err}</div>
            ) : t.a ? (
              <div className="space-y-2">
                <div className="text-sm whitespace-pre-wrap">{t.a.answer}</div>
                {t.a.references.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {t.a.references.map((r, j) => <CitationChip key={j} ref={r} />)}
                  </div>
                )}
              </div>
            ) : (
              <Spinner label="Thinking…" />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="What is in this pack?"
          className="flex-1 bg-transparent border border-[var(--border)] rounded-md px-3 py-2 outline-none focus:border-[var(--accent)]"
        />
        <button
          onClick={ask}
          disabled={busy || !question.trim()}
          className="px-4 py-2 rounded-md bg-[var(--accent)] text-[#0b0d12] font-semibold disabled:opacity-40"
        >
          Ask
        </button>
      </div>
    </div>
  );
}

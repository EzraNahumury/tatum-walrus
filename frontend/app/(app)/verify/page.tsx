"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEntryPage() {
  const router = useRouter();
  const [id, setId] = useState("");

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-semibold">Verify a ProofPack</h1>
      <p className="text-sm text-[var(--muted)]">
        Paste a Sui object ID. We fetch the manifest from Walrus, recompute every
        SHA-256, and tell you if anything has been tampered with.
      </p>
      <div className="flex gap-2">
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="0x…"
          className="flex-1 bg-transparent border border-[var(--border)] rounded-md px-3 py-2 font-mono text-sm"
        />
        <button
          onClick={() => id.trim() && router.push(`/verify/${id.trim()}`)}
          className="px-4 py-2 rounded-md bg-[var(--accent)] text-[#0b0d12] font-semibold"
        >
          Verify
        </button>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";

export function FileDropzone({
  files,
  onChange,
  disabled,
}: {
  files: File[];
  onChange: (next: File[]) => void;
  disabled?: boolean;
}) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function add(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (!next.find((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    onChange(next);
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          drag ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)]"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <p className="text-sm">Drop files here, or click to choose.</p>
        <p className="text-xs text-[var(--muted)] mt-1">Anything: PDFs, images, JSON, MD, CSV…</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => add(e.currentTarget.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-3 text-sm divide-y divide-[var(--border)] border border-[var(--border)] rounded-md">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex justify-between px-3 py-2">
              <span className="truncate">{f.name}</span>
              <span className="text-[var(--muted)] text-xs">{(f.size / 1024).toFixed(1)} KB</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

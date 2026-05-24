"use client";

import { useRef, useState } from "react";
import { Trash2, UploadCloud } from "lucide-react";

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

  function removeAt(idx: number) {
    onChange(files.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          add(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-dashed p-8 text-center transition-all ${
          drag
            ? "border-[var(--color-violet-soft)] bg-[rgba(145,129,245,0.06)]"
            : "border-border bg-bg/40 hover:border-border-strong hover:bg-white/[0.02]"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(420px 200px at 50% 0%, rgba(145,129,245,0.18), transparent 70%)",
          }}
        />
        <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-border-strong bg-bg/60 text-fg-muted">
          <UploadCloud className="size-5" />
        </span>
        <p className="mt-4 text-sm font-medium text-fg">Drop files here, or click to choose</p>
        <p className="mt-1 text-xs text-fg-dim">
          PDFs · images · JSON · Markdown · CSV — anything verifiable
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => add(e.currentTarget.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-bg/30 text-sm">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 px-3 py-2">
              <span className="truncate font-medium text-fg">{f.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-fg-dim tabular">{(f.size / 1024).toFixed(1)} KB</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAt(i);
                  }}
                  className="rounded-md p-1 text-fg-dim transition-colors hover:bg-white/[0.06] hover:text-[var(--color-danger)]"
                  aria-label={`Remove ${f.name}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

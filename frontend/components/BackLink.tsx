"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackLink({
  href,
  label = "Back",
}: {
  href?: string;
  label?: string;
}) {
  const router = useRouter();
  if (href) {
    return (
      <Link
        href={href}
        className="group inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        <span className="grid size-7 place-items-center rounded-full border border-border-strong bg-bg/40 transition-transform group-hover:-translate-x-0.5">
          <ArrowLeft className="size-3.5" />
        </span>
        <span className="font-medium">{label}</span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="group inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg"
    >
      <span className="grid size-7 place-items-center rounded-full border border-border-strong bg-bg/40 transition-transform group-hover:-translate-x-0.5">
        <ArrowLeft className="size-3.5" />
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

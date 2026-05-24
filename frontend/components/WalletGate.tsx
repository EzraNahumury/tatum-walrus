"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { Layers } from "lucide-react";

export function WalletGate({
  children,
  title = "Connect a Sui wallet",
  body = "Sign in with your wallet to view this page.",
}: {
  children: React.ReactNode;
  title?: string;
  body?: string;
}) {
  const account = useCurrentAccount();
  if (!account) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-2xl border border-border-strong bg-bg/40 text-fg-muted">
          <Layers className="size-6" />
        </span>
        <div>
          <h3
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-tech), ui-sans-serif, system-ui" }}
          >
            {title}
          </h3>
          <p className="mt-1 max-w-md text-sm text-fg-muted">{body}</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

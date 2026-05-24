export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded-md bg-white/[0.04] ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full animate-[ppShimmer_1.6s_ease-in-out_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
        }}
      />
      <style>{`
        @keyframes ppShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 last:border-b-0">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-7 w-20 rounded-full" />
    </div>
  );
}

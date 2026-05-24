import Image from "next/image";

type Size = "sm" | "md" | "lg";

const PX: Record<Size, number> = { sm: 18, md: 28, lg: 56 };

export function LoadingLogo({ label, size = "sm" }: { label?: string; size?: Size }) {
  const px = PX[size];
  return (
    <span className="inline-flex items-center gap-2 text-sm text-fg-muted">
      <span
        className="relative inline-block animate-[ppFloat_2.4s_ease-in-out_infinite]"
        style={{ width: px, height: px }}
      >
        <Image src="/logo-v2.png" alt="Loading" width={px} height={px} className="drop-shadow-[0_0_8px_rgba(145,129,245,0.55)]" />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full animate-[ppPulse_2s_ease-out_infinite]"
          style={{
            background: "radial-gradient(closest-side, rgba(145,129,245,0.5), transparent 70%)",
          }}
        />
      </span>
      {label && <span>{label}</span>}
      <style>{`
        @keyframes ppFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(6deg); }
        }
        @keyframes ppPulse {
          0% { transform: scale(0.85); opacity: 0.6; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </span>
  );
}

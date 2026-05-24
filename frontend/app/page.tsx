import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="space-y-6 max-w-3xl">
        <Image
          src="/logo-v2.png"
          alt="ProofPack AI logo"
          width={120}
          height={120}
          priority
        />
        <span className="inline-block text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
          Sui · Walrus · Tatum
        </span>
        <h1 className="text-3xl sm:text-5xl font-semibold leading-tight">
          Verifiable AI Data Room.
          <br />
          <span className="text-[var(--muted)]">Every answer comes with a proof.</span>
        </h1>
        <p className="text-lg text-[var(--muted)] leading-relaxed">
          ProofPack AI lets anyone bundle files into a tamper-proof pack stored on Walrus,
          anchored on Sui through Tatum, and queried by an AI assistant that must cite
          cryptographic evidence for every claim.
        </p>
        <div className="flex gap-3">
          <Link
            href="/pack/new"
            className="px-5 py-3 rounded-md bg-[var(--accent)] text-[#0b0d12] font-semibold"
          >
            Create ProofPack
          </Link>
          <Link
            href="/verify"
            className="px-5 py-3 rounded-md border border-[var(--border)] hover:border-[var(--accent)]"
          >
            Verify a pack
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card title="Store on Walrus" body="Files become content-addressed blobs on Walrus decentralized storage. Trustless, durable, cheap." />
        <Card title="Anchor on Sui via Tatum" body="A Move contract records the manifest hash, owner, and timestamp using Tatum Sui RPC nodes." />
        <Card title="AI with cryptographic citations" body="The assistant answers only from manifest context, citing blobId + sha256 + objectId. No hallucinations." />
      </section>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-[var(--border)] rounded-lg p-5">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[var(--muted)] leading-relaxed">{body}</p>
    </div>
  );
}

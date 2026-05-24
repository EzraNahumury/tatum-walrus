export const nav = {
  brand: "ProofPack AI",
  links: [
    { label: "How it works", href: "#how" },
    { label: "Why ProofPack", href: "#capabilities" },
    { label: "FAQ", href: "#faq" },
    { label: "Docs", href: "#academy" },
  ],
  cta: { label: "Launch app", href: "/dashboard" },
};

export const hero = {
  badge: "Built on Sui · Walrus · Tatum RPC · MCP-ready",
  title: ["Verifiable AI Data Room,", "anchored on Sui,", "stored on Walrus."],
  subtitle:
    "Upload any file, get a tamper-proof ProofPack. Walrus stores the bytes, Sui anchors the hash, the AI assistant answers with cryptographic proof for every claim.",
  ctaPrimary: { label: "Create ProofPack", href: "/pack/new" },
  ctaSecondary: { label: "See how it works", href: "#how" },
  stats: [
    { value: "0", label: "Trust required from the verifier" },
    { value: "100%", label: "Bytes on decentralized storage" },
    { value: "9", label: "Move tests passing" },
    { value: "1-click", label: "Public verifier link" },
  ],
  headline: [
    [
      { text: "Upload", tone: "muted" },
      { text: "evidence.", tone: "strong" },
    ],
    [{ text: "Let the chain prove it.", tone: "strong" }],
    [
      { text: "The", tone: "muted" },
      { text: "AI", tone: "strong" },
      { text: "answers with proof", tone: "muted" },
    ],
    [{ text: "every time.", tone: "strong" }],
  ] as const,
  description:
    "ProofPack AI removes everything sharing important files makes you fight — no trusting the sender, no centralized storage, no hallucinating chatbots. One upload. One on-chain anchor. The AI cites blobId + hash + objectId on every answer.",
  openApp: { label: "Create ProofPack", href: "/pack/new" },
};

export const whatYouCanDo = {
  title: "Three primitives. One verifiable pack.",
  cards: [
    {
      name: "Bytes live on Walrus",
      body: "Every file in a ProofPack is a content-addressed blob on Walrus decentralized storage. No vendor lock-in, no centralized server, no silent edits.",
    },
    {
      name: "Hash anchored on Sui",
      body: "A Move object records the manifest SHA-256, owner address, timestamp, and version — submitted through the Tatum Sui RPC gateway with full transaction attribution.",
    },
    {
      name: "AI cites cryptographic proof",
      body: "The assistant answers only from the manifest. Every claim includes the source filename, blobId, sha256, and Sui objectId. Out-of-pack questions get refused, not hallucinated.",
    },
  ],
};

export const howAuralis = {
  title: "How ProofPack AI Works",
  cards: [
    {
      index: "01",
      name: "Create & Anchor",
      body:
        "Connect a Sui wallet, drag in your files. Each file streams to Walrus and we hash it. The canonical manifest is uploaded, then a Move call on Sui via Tatum RPC binds the hash to your address with one signature.",
    },
    {
      index: "02",
      name: "Verify & Question",
      body:
        "Share the public verifier link — anyone can refetch from Walrus, recompute every SHA-256, and confirm the on-chain hash matches. Then ask the AI anything; replies cite blobId + sha256 for every fact, or refuse if the answer isn't in the pack.",
    },
  ],
};

export const problems = [
  {
    title: "Sending files via Drive / Dropbox",
    body: "Recipients must trust the sender and the host. ProofPack uses Walrus content-addressing — bytes are verifiable, not assumed.",
  },
  {
    title: "AI summaries that hallucinate",
    body: "Generic LLMs confidently make up numbers. ProofPack's assistant refuses any claim it can't cite by blobId + sha256.",
  },
  {
    title: "Audits demanding chain-of-custody",
    body: "Legal, grant, and insurance reviewers need cryptographic proof a file wasn't altered. The on-chain manifest hash is that proof.",
  },
  {
    title: "Manual hash verification",
    body: "The verifier page does it for you — fetches each blob, recomputes SHA-256, compares to on-chain hash, renders VALID/INVALID with a per-file diff.",
  },
  {
    title: "Vendor lock-in on storage",
    body: "Walrus is decentralized and trustless — no provider can silently delete or rewrite a blob without invalidating the on-chain hash.",
  },
];

export const solution = {
  eyebrow: "Solution",
  title: "One Move contract. One Walrus blob set. One grounded AI.",
  body:
    "ProofPack AI composes a Sui Move package, Walrus decentralized storage, and Tatum's Sui RPC gateway into a single self-contained verifiable data room — no database, no servers to trust.",
  contracts: [
    {
      name: "proofpack::ProofPack",
      role: "Per-pack object: owner, manifestBlobId, manifestHash (32B), version, visibility, createdAt, previousVersion.",
      tag: "Core",
    },
    {
      name: "proofpack::Registry",
      role: "Shared counter object emitting the global ProofPackCreated event stream.",
      tag: "Index",
    },
    {
      name: "Walrus Publisher",
      role: "Stores file bytes + canonical manifest JSON + verification reports as content-addressed blobs.",
      tag: "Storage",
    },
    {
      name: "Tatum Sui RPC Gateway",
      role: "Single ingress for sui_getObject, sui_executeTransactionBlock, and event queries. Usage attributed via x-api-key.",
      tag: "RPC",
    },
    {
      name: "Grounded AI",
      role: "Ollama / Claude / OpenAI / MCP. Server-side filter drops citations not present in manifest.",
      tag: "AI",
    },
    {
      name: "Public Verifier",
      role: "Stateless page anyone can open. Recomputes SHA-256 of every blob and compares to on-chain hash.",
      tag: "Trust",
    },
  ],
};

export const features = [
  {
    icon: "Sparkles",
    title: "Sui wallet, no signup",
    body: "Connect via dApp Kit (Sui Wallet, Suiet, Phantom-Sui). No email, no password, no server-stored credentials.",
  },
  {
    icon: "Scale",
    title: "Three visibility modes",
    body: "Private (owner only), Unlisted (link-gated), Public (verifier-discoverable). Set at create time, changeable later.",
  },
  {
    icon: "Zap",
    title: "Hash-recompute verifier",
    body: "Public /verify/[id] refetches every blob from Walrus, recomputes SHA-256 in the browser, and compares to the on-chain hash.",
  },
  {
    icon: "Network",
    title: "Tatum-attributed RPC",
    body: "All Sui reads + writes flow through *.gateway.tatum.io with x-api-key. Counts toward the Best Use of Tatum Tools prize.",
  },
  {
    icon: "ShieldCheck",
    title: "Grounded AI refusal",
    body: "Ask anything; replies cite blobId + sha256 + objectId. If the answer isn't in the pack, the AI says \"Not found in this ProofPack\" — never invents.",
  },
  {
    icon: "FileLock",
    title: "Versioning chain",
    body: "update_version consumes the previous pack and links to it. Audit trail of every manifest change, fully on-chain.",
  },
];

export const workflow = {
  eyebrow: "How it works",
  title: "Six steps from upload to grounded AI.",
  body:
    "Every action is signed by the user wallet; nothing requires a server-held key. The contract enforces hashes; Walrus stores bytes; Tatum routes RPC.",
  steps: [
    {
      n: "01",
      title: "Connect wallet",
      body: "Sui dApp Kit picks up any installed Sui wallet (Sui Wallet, Suiet, Phantom-Sui). No emails, no recovery seeds for the app to hold.",
    },
    {
      n: "02",
      title: "Drop files",
      body: "Pick title + tags + visibility, drag in files. Each file streams to /api/upload which forwards to the Walrus publisher and returns blobId + size + content type.",
    },
    {
      n: "03",
      title: "Hash everything",
      body: "Client computes SHA-256 of each file as it's hashed server-side. Manifest is built in canonical JSON (sorted keys) so the hash is reproducible.",
    },
    {
      n: "04",
      title: "Upload manifest to Walrus",
      body: "manifest.json -> blobId + manifestHash. Both client and server hash the same canonical bytes — divergence aborts before any tx.",
    },
    {
      n: "05",
      title: "Anchor on Sui via Tatum",
      body: "Wallet signs a moveCall to proofpack::create binding (manifestBlobId, manifestHash, visibility) to your address with a clock timestamp. RPC goes through sui-testnet.gateway.tatum.io.",
    },
    {
      n: "06",
      title: "Share + verify + chat",
      body: "Public /verify/[id] link works without a wallet. /chat asks AI grounded in the manifest with cryptographic citations on every answer.",
    },
  ],
};

export const agents = {
  eyebrow: "AI topology",
  title: "Grounded answers. Refusal by default.",
  body:
    "ProofPack's assistant is a thin orchestration layer over Ollama / Claude / OpenAI / MCP. The grounding filter is the policy: any reference whose blobId isn't in the manifest is dropped server-side before the answer ships to the browser.",
  tiers: [
    {
      tag: "Layer 1",
      name: "Context Builder",
      mission: "Build the prompt strictly from manifest + readable file texts.",
      checks: [
        { label: "Manifest as system context", weight: "always" },
        { label: "Text/JSON/MD/CSV file bodies", weight: "extracted" },
        { label: "Binary files", weight: "metadata only" },
        { label: "System prompt forces JSON output", weight: "required" },
        { label: "Citation schema", weight: "filename + blobId + sha256" },
        { label: "Refusal phrase", weight: "Not found in this ProofPack" },
      ],
    },
    {
      tag: "Layer 2",
      name: "Grounding Filter",
      mission: "Reject any citation that doesn't exist on Walrus blobs in this pack.",
      checks: [
        { label: "blobId must match manifest entry" },
        { label: "Unknown blobIds dropped silently" },
        { label: "Empty references => notFound:true" },
        { label: "Refusal phrase auto-substituted" },
        { label: "Tatum MCP tools (sui_getObject etc.) optional" },
        { label: "Live transcripts can self-anchor to Walrus" },
      ],
    },
  ],
};

export const reputation = {
  eyebrow: "Use cases",
  title: "Three visibility modes, one verifiable record.",
  body:
    "Visibility is the policy lever. The hash, owner, and timestamp are always on-chain — discoverability is what changes.",
  tiers: [
    { name: "Private", range: "Owner-only · default for drafts", accent: "from-emerald-400/70 to-emerald-200/20" },
    { name: "Unlisted", range: "Link-gated · recommended for grants", accent: "from-violet-400/70 to-violet-200/20" },
    { name: "Public", range: "Indexed via Registry events", accent: "from-amber-400/80 to-rose-300/30" },
  ],
  badges: [
    { name: "Legal evidence", trigger: "Lawyers prove a file existed and was unchanged at a timestamp.", rep: "Ready" },
    { name: "Grant reporting", trigger: "Founders submit verifiable revenue + attestation packs.", rep: "Ready" },
    { name: "Audit trail", trigger: "DAOs publish transparency reports anyone can verify.", rep: "Ready" },
    { name: "Insurance claims", trigger: "Claim evidence anchored before submission for chain-of-custody.", rep: "Ready" },
    { name: "Academic certificates", trigger: "Issuers anchor diplomas; verifiers recompute hash in browser.", rep: "Soon" },
  ],
};

export const preview = {
  eyebrow: "Live demo",
  title: "Watch a real pack flow through verify.",
  body:
    "Demo pack 0xa3f9c701…6c95f is live on Sui testnet right now. Open the verifier to see manifest + 4 files refetched from Walrus and compared to the on-chain hash.",
};

export const impact = {
  eyebrow: "Why it matters",
  title: "Trust shifts from sender to math.",
  body:
    "Every part of a ProofPack can be re-checked without trusting us. Walrus serves bytes; Sui serves hash; the verifier runs in the user's browser. ProofPack AI just glues them together with an AI that refuses to lie.",
  points: [
    { stat: "0 trust", label: "the verifier never trusts our server" },
    { stat: "100% on-chain", label: "hash, owner, timestamp on Sui via Tatum" },
    { stat: "Walrus-resident", label: "bytes live on decentralized storage" },
    { stat: "Refusal-by-default", label: "AI cites blobId or returns Not found" },
  ],
};

export const faq = {
  title: "Frequently Asked Questions",
  hint: "Everything you need to know before publishing your first pack.",
  community: {
    label: "Have a question?\nAsk on GitHub.",
    href: "https://github.com/EzraNahumury/tatum-walrus",
  },
  items: [
    {
      q: "How is a ProofPack tamper-evident?",
      a: "The manifest JSON is uploaded to Walrus as a content-addressed blob. Its SHA-256 is recorded on Sui via the Move proofpack::create call. Anyone can refetch the blob from Walrus, recompute the SHA-256 in their own browser, and compare to the on-chain hash. Mismatch = tampered.",
    },
    {
      q: "Why Walrus instead of IPFS or S3?",
      a: "Walrus is Sui-native decentralized storage with explicit storage epochs and aggregator/publisher endpoints. It's tightly composable with Sui Move objects, which is exactly what the hackathon brief asks for. The bytes are content-addressed (blobId is derived from content) so substitution is impossible without changing the blobId.",
    },
    {
      q: "Why route everything through Tatum?",
      a: "Tatum provides enterprise-grade Sui RPC endpoints — sui-mainnet.gateway.tatum.io, sui-testnet.gateway.tatum.io, sui-devnet.gateway.tatum.io. All reads (sui_getObject, sui_getEvents) and the writes (sui_executeTransactionBlock) flow through Tatum with x-api-key for usage attribution. That's the hackathon Best Use of Tatum Tools requirement.",
    },
    {
      q: "How does the AI avoid hallucinating?",
      a: "Two layers. (1) The system prompt forces JSON output with a citations array, and only allows the model to cite filenames present in the manifest. (2) Server-side, we drop any reference whose blobId is not in the manifest. If nothing valid remains, the answer is replaced with \"Not found in this ProofPack.\"",
    },
    {
      q: "What blockchain does ProofPack run on?",
      a: "Sui. The Move package proofpack is deployed to Sui testnet at 0x7d73…6e1d with a shared Registry at 0x39e8…9e50. Mainnet deploy is a one-command switch — same Move code, same artifacts.",
    },
    {
      q: "Can I update a pack after publishing?",
      a: "Yes — call proofpack::update_version. The old pack object is consumed and a new pack is created with previousVersion linked to the old objectId. Owner-only. The dashboard and detail page render the version chain.",
    },
    {
      q: "Is my wallet key ever sent to your server?",
      a: "No. All write transactions are built server-side as unsigned bytes, sent to the browser, signed by your wallet extension, and submitted via the dApp Kit. The server never holds a private key.",
    },
  ],
};

export const ctaSection = {
  title: "Anchor your first verifiable pack in 60 seconds.",
  body:
    "Connect a Sui wallet. Drag in files. Sign once. Get a public verify link and a grounded AI you can ask anything — every answer cites cryptographic proof.",
  primary: { label: "Create ProofPack", href: "/pack/new" },
  secondary: { label: "Read the docs", href: "https://github.com/EzraNahumury/tatum-walrus" },
};

export const footer = {
  brand: "ProofPack AI",
  tagline: "Verifiable AI data room on Sui + Walrus + Tatum.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "How it works", href: "#how" },
        { label: "Why ProofPack", href: "#capabilities" },
        { label: "Dashboard", href: "/dashboard" },
      ],
    },
    {
      title: "Build",
      links: [
        { label: "GitHub", href: "https://github.com/EzraNahumury/tatum-walrus" },
        { label: "Sui docs", href: "https://docs.sui.io/" },
        { label: "Walrus docs", href: "https://docs.wal.app/" },
      ],
    },
    {
      title: "Powered by",
      links: [
        { label: "Tatum RPC", href: "https://tatum.io/chain/sui" },
        { label: "Walrus", href: "https://www.walrus.xyz/" },
        { label: "Sui Network", href: "https://sui.io/" },
      ],
    },
  ],
};

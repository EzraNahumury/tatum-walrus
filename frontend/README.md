# ProofPack AI — Frontend

Next.js 16 (App Router · Turbopack) frontend for [ProofPack AI](../README.md). For project background, architecture, and full hackathon context, see the **[root README](../README.md)**.

Live: <https://proofpack-ai.vercel.app/>

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, server components, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + custom design tokens (`globals.css`) |
| Sui SDK | `@mysten/sui` 1.38, `@mysten/dapp-kit` 0.18 (`SuiHTTPTransport` w/ `x-api-key`) |
| Animation | GSAP + ScrollTrigger (landing), framer-motion (cards), Lenis (smooth scroll) |
| AI | Ollama Cloud (default) / Claude / OpenAI / MCP — all pluggable, all grounded |

---

## Routes

| Path | Purpose | Auth |
|---|---|---|
| `/` | Landing page | Public |
| `/dashboard` | List of ProofPacks owned by the connected wallet | Wallet |
| `/pack/new` | Create wizard — upload → sign → anchor | Wallet |
| `/pack/[id]` | Detail page — manifest, files, chat | Wallet (gated) |
| `/verify` | Verifier entry form | Public |
| `/verify/[id]` | Public verifier — SHA-256 recompute + VALID/INVALID | Public |
| `/api/health` | Tatum RPC + Walrus reachability check | — |
| `/api/upload` | Multipart upload → Walrus (one file per request) | — |
| `/api/proofpack/manifest` | Hash canonical JSON manifest, upload to Walrus | — |
| `/api/proofpack/[id]` | Server proxy for Sui `sui_getObject` + Walrus manifest fetch | — |
| `/api/execute` | Submit wallet-signed tx via Tatum (bypass browser CORS) | — |
| `/api/verify/[id]` | Full SHA-256 recompute, anchors report to Walrus | — |
| `/api/chat/[id]` | Grounded AI Q&A with citation filter | — |
| `/api/balance` | Wallet balance proxy | — |
| `/api/owned` | List ProofPack objects for an address | — |

---

## Architecture notes

**Why every Sui RPC call is server-proxied:** Tatum's public gateway responses don't include `Access-Control-Allow-Origin` for `sui_executeTransactionBlock`, so the browser blocks it as a CORS error. We sign in the wallet client-side and submit through `/api/execute` server-side — same flow, no CORS, and **the call is attributed via `x-api-key`** which counts toward the *Best Use of Tatum Tools* prize.

**Why grounded AI never hallucinates:**
1. System prompt forces JSON output with a `references[]` schema and the literal refusal phrase `"Not found in this ProofPack."`
2. `lib/ai/provider.ts → groundAnswer()` drops any returned citation whose `blobId` is **not** in the actual manifest before shipping to the browser.
3. If nothing valid survives the filter, the answer is replaced with the refusal phrase.

**Why uploads are per-file:** batching N files into one `/api/upload` made the entire create flow brittle to a single Walrus testnet hiccup. One-file-per-request + 3-try retry with 45s `AbortController` timeout + 800ms exponential backoff is dramatically more reliable on flaky public infra.

---

## Scripts

```bash
npm run dev          # http://localhost:3000
npm run build        # production build
npm run start        # serve production build
npm run lint         # ESLint
npm run seed:demo    # seed a demo ProofPack end-to-end (Walrus + Sui)
```

`seed:demo` reads `SEED_PRIVATE_KEY` from `.env.local` and creates a fresh pack on testnet — prints the objectId + verifier URL on success.

---

## Local development

```bash
cd frontend
cp .env.local.example .env.local     # fill in TATUM_API_KEY at minimum
npm install
npm run dev
```

`.env.local` keys are documented in [the root README §Environment variables](../README.md#environment-variables).

### Common gotchas

| Symptom | Cause | Fix |
|---|---|---|
| `Failed to fetch` on dashboard | Old Next dev process holding port 3000 with stale cache | Kill all `node` procs, `rm -rf .next`, `npm run dev` |
| `Failed to fetch` on create | Tatum CORS on `sui_executeTransactionBlock` | Code already routes through `/api/execute`; if browser still hits Tatum directly, hard-reload (Ctrl+Shift+R) to bust HMR cache |
| `429 Too Many Requests` | Tatum free-tier burst limit | `lib/retry.ts` `withRpcRetry` handles it server-side; wait or upgrade plan |
| `Walrus blob fetch failed` | Blob's storage epochs expired | Re-seed: `npm run seed:demo` |
| Wallet panel shows `— SUI` | `useSuiClientQuery` hit browser CORS | Already fixed: balance fetched via `/api/balance` server proxy |

---

## Folder map

```
frontend/
├── app/
│   ├── (app)/         ← authenticated app routes (Header wrapper)
│   ├── api/           ← server routes (Tatum + Walrus + AI proxies)
│   ├── page.tsx       ← landing page
│   ├── layout.tsx     ← root layout (fonts, providers, Lenis)
│   └── globals.css    ← Tailwind + design tokens
├── components/
│   ├── landing/       ← Hero, FAQ, StackMarquee, GSAP visuals
│   ├── motion/        ← Reveal, MagneticButton, Counter
│   ├── ui/            ← Badge, Button, Card, Toggle
│   ├── PackCard.tsx   ← 3D tilt + shimmer
│   ├── JsonView.tsx   ← VS Code-style JSON viewer
│   ├── WalletPanel.tsx
│   ├── WalletGate.tsx
│   ├── ChatPanel.tsx
│   └── …
├── lib/
│   ├── ai/            ← provider router + 4 backends + grounding
│   ├── sui/           ← Tatum-wrapped SuiClient, tx builder, parsers
│   ├── tatum/         ← API client + Storage API
│   ├── walrus/        ← upload (retry) + fetch (IPFS fallback)
│   ├── hash/          ← Web Crypto SHA-256
│   ├── manifest.ts    ← canonical JSON manifest
│   ├── retry.ts       ← exponential backoff on RPC 429
│   ├── env.ts         ← typed env loader
│   └── types.ts
└── scripts/
    └── seed-demo.ts   ← end-to-end seed (4 fixture files → Walrus → Sui)
```

---

## Deploy

Production is on **Vercel**, framework auto-detected, root directory `frontend/`.

See [`../DEPLOY.md`](../DEPLOY.md) for the env-vars block and step-by-step.

---

## License

MIT. PRs welcome.

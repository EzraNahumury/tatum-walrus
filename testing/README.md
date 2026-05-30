# Test packs

Local fixtures for manually testing /pack/new in the browser. Gitignored.

## Quick guide

1. Open http://localhost:3000/pack/new
2. Pick a pack folder below, copy the form values, drag the files into the dropzone
3. Sign in wallet, wait for the redirect to the detail page
4. On the detail page, try the AI chat questions listed under each pack — confirm grounding (citations) and refusal behavior

---

## Pack 1 — pack-grant/ (4 files)

**Title:** `Startup Due Diligence Pack`
**Description:** `Acme AI grant submission — Q4 2026 revenue + roadmap + founder attestation. All bytes anchored on Sui via Tatum, stored on Walrus.`
**Tags:** `grant, q4-2026, evidence, acme-ai`
**Visibility:** `Public`

Files:
- `pitch-deck-summary.md`
- `revenue-proof.json`
- `product-roadmap.md`
- `founder-attestation.txt`

Test AI prompts:
- "What is the projected ARR in this pack?" → expect `$420,000` citing `revenue-proof.json`
- "Who is the CTO?" → expect `Sara Wong` citing `pitch-deck-summary.md`
- "What's the founder's birthday?" → expect refusal `Not found in this ProofPack.`
- "What is the runway?" → expect `14 months` citing `revenue-proof.json`

---

## Pack 2 — pack-dao/ (3 files)

**Title:** `DAO Q1 2026 Transparency Report`
**Description:** `Treasury movements, proposals passed, contributor payouts. Verifiable by anyone with the Sui objectId.`
**Tags:** `dao, transparency, treasury, q1-2026`
**Visibility:** `Public`

Files:
- `treasury.json`
- `proposals-passed.md`
- `multisig-signatures.txt`

Test AI prompts:
- "What was the treasury SUI balance?" → expect `142,000` citing `treasury.json`
- "Which proposal had the highest yes %?" → expect `DIP-016 with 94%` citing `proposals-passed.md`
- "Who is the treasurer's spouse?" → expect refusal

---

## Pack 3 — pack-diploma/ (3 files)

**Title:** `BSc Computer Science Diploma — Garry Doe`
**Description:** `Issued by Acme University 2026-04-15. Verifiable via Sui.`
**Tags:** `diploma, education, bsc, cs`
**Visibility:** `Unlisted`

Files:
- `diploma.md`
- `transcript.json`
- `registrar-signature.txt`

Test AI prompts:
- "What was Garry Doe's GPA?" → expect `3.92` citing `transcript.json`
- "How many credits did Garry earn?" → expect `144` citing `transcript.json`
- "When did Garry get a Master's?" → expect refusal

---

## Tamper test (proves verifier works)

1. Create any pack from above
2. Note the `objectId` from the detail page
3. Open the verifier URL: `http://localhost:3000/verify/<objectId>` → should show **VALID** ✅
4. The verifier recomputes SHA-256 of every blob on Walrus and compares to the on-chain hash. Any byte change = INVALID.

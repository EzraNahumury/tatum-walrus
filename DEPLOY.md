# Vercel Deploy Guide

Hosted, free, public URL the judges can open in 2 minutes.

## 1. Create Vercel project

Two options:

### Option A — Vercel CLI (fastest, no GitHub remote needed)

```bash
cd frontend
npx vercel@latest login
npx vercel@latest                # interactive: link / create project
npx vercel@latest --prod         # production deploy
```

### Option B — GitHub import

1. Push this repo to GitHub.
2. Go to https://vercel.com/new
3. Import `tatum-walrus`, pick **Root Directory = `frontend`**.
4. Build / Output settings: leave as auto-detected (Next.js).

## 2. Environment variables (paste in Vercel project settings → Environment Variables)

| Variable | Value |
|----------|-------|
| `TATUM_API_KEY` | from dashboard.tatum.io (testnet JSON-RPC) |
| `NEXT_PUBLIC_SUI_NETWORK` | `testnet` |
| `NEXT_PUBLIC_TATUM_SUI_RPC_URL` | `https://sui-testnet.gateway.tatum.io` |
| `WALRUS_UPLOAD_MODE` | `walrus_publisher` |
| `WALRUS_PUBLISHER_URL` | `https://publisher.walrus-testnet.walrus.space` |
| `WALRUS_AGGREGATOR_URL` | `https://aggregator.walrus-testnet.walrus.space` |
| `NEXT_PUBLIC_WALRUS_AGGREGATOR_URL` | `https://aggregator.walrus-testnet.walrus.space` |
| `WALRUS_DEFAULT_EPOCHS` | `30` |
| `NEXT_PUBLIC_PACKAGE_ID` | `0x7d73e2b962e9d769bc20bd61fe87999e6b987ef7761bfde11f8b337bc7406e1d` |
| `NEXT_PUBLIC_PROOFPACK_REGISTRY_ID` | `0x39e89ddfa9f29e1285b5eab4c80e24bbcaa5a242c582fd21e240673e0a099e50` |
| `AI_PROVIDER` | `ollama` (or `mcp` for Tatum-RPC tool calls) |
| `OLLAMA_HOST` | `https://ollama.com` |
| `OLLAMA_KEY` | from ollama.com |
| `OLLAMA_MODEL` | `gpt-oss:120b-cloud` |

**Do NOT** set `SEED_PRIVATE_KEY` in Vercel. That key is local-only for `npm run seed:demo` and would let anyone re-seed from your address.

## 3. Smoke test the deploy

After Vercel finishes the build, open:
- `https://<your-deploy>.vercel.app/` — landing page
- `https://<your-deploy>.vercel.app/api/health` — must return JSON with `checks.tatumRpc.ok: true`
- `https://<your-deploy>.vercel.app/verify/0xa3f9c701ca4dc50da787b48168d8339ea7d2aefc7d10b0c3a8cec06bfcf6c95f` — the demo pack, must show **VALID**.

## 4. Custom domain (optional)

In Vercel project → Settings → Domains → add your domain. Update DNS as shown.

## Troubleshooting

- **`Missing required env var: TATUM_API_KEY`** in API routes → forgot to add the env var, redeploy after adding.
- **`429 Too Many Requests`** → Tatum free tier rate-limit; upgrade plan or wait.
- **Walrus blob fetch fails** → blob epoch expired. SSH to your local box and run `npm run seed:demo` to refresh + update `NEXT_PUBLIC_*` ids in Vercel.

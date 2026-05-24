function toHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    const h = bytes[i].toString(16).padStart(2, "0");
    out += h;
  }
  return out;
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error("Invalid hex");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

export async function sha256Hex(input: ArrayBuffer | Uint8Array | string): Promise<string> {
  let buf: ArrayBuffer;
  if (typeof input === "string") {
    buf = new TextEncoder().encode(input).buffer as ArrayBuffer;
  } else if (input instanceof Uint8Array) {
    // Copy into a stand-alone ArrayBuffer so crypto.subtle accepts it.
    const copy = new Uint8Array(input.byteLength);
    copy.set(input);
    buf = copy.buffer;
  } else {
    buf = input;
  }
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return toHex(new Uint8Array(digest));
}

export async function sha256OfFile(file: File): Promise<string> {
  const ab = await file.arrayBuffer();
  return sha256Hex(ab);
}

/** Canonical-ish JSON: sort keys recursively for stable hashing. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    const keys = Object.keys(v as Record<string, unknown>).sort();
    for (const k of keys) out[k] = sortKeys((v as Record<string, unknown>)[k]);
    return out;
  }
  return v;
}

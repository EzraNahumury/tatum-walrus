export type Hex = `0x${string}`;
export type Sha256Hex = string;
export type WalrusBlobId = string;

export type SuiNetwork = "mainnet" | "testnet" | "devnet";
export type Visibility = "private" | "unlisted" | "public";

export interface ProofPackFile {
  filename: string;
  contentType: string;
  size: number;
  sha256: Sha256Hex;
  blobId: WalrusBlobId;
}

export interface ProofPackManifest {
  schemaVersion: 1;
  title: string;
  description?: string;
  tags?: string[];
  owner: Hex;
  createdAtMs: number;
  files: ProofPackFile[];
  previousManifestBlobId?: WalrusBlobId;
}

export interface ProofPackOnChain {
  objectId: Hex;
  owner: Hex;
  manifestBlobId: WalrusBlobId;
  manifestHash: Sha256Hex;
  version: number;
  visibility: Visibility;
  createdAtMs: number;
  previousVersionId?: Hex;
}

export interface ProofPackFull {
  onChain: ProofPackOnChain;
  manifest: ProofPackManifest;
}

export interface VerificationReport {
  objectId: Hex;
  network: SuiNetwork;
  manifestOk: boolean;
  files: Array<{
    filename: string;
    blobId: WalrusBlobId;
    expected: Sha256Hex;
    actual: Sha256Hex;
    ok: boolean;
  }>;
  valid: boolean;
  generatedAtMs: number;
  tatumRpcUrl: string;
  reportBlobId?: WalrusBlobId;
}

export interface AICitation {
  filename: string;
  blobId: WalrusBlobId;
  sha256: Sha256Hex;
  objectId: Hex;
  snippet?: string;
}

export interface AIAnswer {
  answer: string;
  references: AICitation[];
  notFound: boolean;
}

export interface UploadResult {
  filename: string;
  contentType: string;
  size: number;
  sha256: Sha256Hex;
  blobId: WalrusBlobId;
}

export interface ApiError {
  code: string;
  message: string;
  retryable?: boolean;
}

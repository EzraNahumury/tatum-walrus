/// ProofPack AI — verifiable evidence registry on Sui.
/// Anchors a Walrus manifest blob hash on-chain with owner + timestamp.
module sc::proofpack;

use std::string::String;
use sui::clock::{Self, Clock};
use sui::event;

// === Errors ===
const ENotOwner: u64 = 1;
const EInvalidHashLength: u64 = 2;
const EInvalidVisibility: u64 = 3;

// === Constants ===
const SHA256_BYTES: u64 = 32;
const VIS_PRIVATE: u8 = 0;
const VIS_UNLISTED: u8 = 1;
const VIS_PUBLIC: u8 = 2;

// === Objects ===

/// Shared registry that counts published packs and emits a global stream.
public struct Registry has key {
    id: UID,
    count: u64,
}

/// A single tamper-proof evidence pack.
/// `manifest_blob_id` points at a Walrus blob containing the manifest JSON;
/// `manifest_hash` is the SHA-256 of those exact manifest bytes.
public struct ProofPack has key, store {
    id: UID,
    owner: address,
    manifest_blob_id: String,
    manifest_hash: vector<u8>,
    version: u64,
    visibility: u8,
    created_at_ms: u64,
    previous_version: Option<ID>,
}

// === Events ===

public struct ProofPackCreated has copy, drop {
    pack_id: ID,
    owner: address,
    manifest_blob_id: String,
    manifest_hash: vector<u8>,
    version: u64,
    visibility: u8,
    timestamp_ms: u64,
}

public struct ProofPackUpdated has copy, drop {
    new_pack_id: ID,
    previous_pack_id: ID,
    owner: address,
    new_manifest_blob_id: String,
    new_manifest_hash: vector<u8>,
    version: u64,
    timestamp_ms: u64,
}

public struct VisibilityChanged has copy, drop {
    pack_id: ID,
    visibility: u8,
}

public struct OwnershipTransferred has copy, drop {
    pack_id: ID,
    from: address,
    to: address,
}

// === Init ===

/// Publishes the shared Registry once at package publish time.
fun init(ctx: &mut TxContext) {
    let registry = Registry { id: object::new(ctx), count: 0 };
    transfer::share_object(registry);
}

// === Public entry functions ===

/// Create a brand new ProofPack.
/// Sender becomes the owner; pack is transferred to sender's address.
public fun create(
    registry: &mut Registry,
    manifest_blob_id: String,
    manifest_hash: vector<u8>,
    visibility: u8,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(manifest_hash.length() == SHA256_BYTES, EInvalidHashLength);
    assert!(visibility <= VIS_PUBLIC, EInvalidVisibility);

    let sender = ctx.sender();
    let now = clock::timestamp_ms(clock);

    let pack = ProofPack {
        id: object::new(ctx),
        owner: sender,
        manifest_blob_id,
        manifest_hash,
        version: 1,
        visibility,
        created_at_ms: now,
        previous_version: option::none(),
    };

    let pack_id = object::id(&pack);

    event::emit(ProofPackCreated {
        pack_id,
        owner: sender,
        manifest_blob_id: pack.manifest_blob_id,
        manifest_hash: pack.manifest_hash,
        version: pack.version,
        visibility: pack.visibility,
        timestamp_ms: now,
    });

    registry.count = registry.count + 1;
    transfer::public_transfer(pack, sender);
}

/// Publish a new version that links back to the previous pack object.
/// Consumes the previous pack (caller must own it) and produces a fresh
/// pack with `previous_version = Some(old_id)` and `version += 1`.
public fun update_version(
    previous: ProofPack,
    new_manifest_blob_id: String,
    new_manifest_hash: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(new_manifest_hash.length() == SHA256_BYTES, EInvalidHashLength);
    let sender = ctx.sender();
    assert!(previous.owner == sender, ENotOwner);

    let now = clock::timestamp_ms(clock);
    let ProofPack {
        id: prev_uid,
        owner,
        manifest_blob_id: _,
        manifest_hash: _,
        version,
        visibility,
        created_at_ms: _,
        previous_version: _,
    } = previous;

    let previous_id = object::uid_to_inner(&prev_uid);
    object::delete(prev_uid);

    let new_pack = ProofPack {
        id: object::new(ctx),
        owner,
        manifest_blob_id: new_manifest_blob_id,
        manifest_hash: new_manifest_hash,
        version: version + 1,
        visibility,
        created_at_ms: now,
        previous_version: option::some(previous_id),
    };

    let new_id = object::id(&new_pack);

    event::emit(ProofPackUpdated {
        new_pack_id: new_id,
        previous_pack_id: previous_id,
        owner,
        new_manifest_blob_id: new_pack.manifest_blob_id,
        new_manifest_hash: new_pack.manifest_hash,
        version: new_pack.version,
        timestamp_ms: now,
    });

    transfer::public_transfer(new_pack, owner);
}

/// Change pack visibility (private | unlisted | public).
public fun set_visibility(pack: &mut ProofPack, visibility: u8, ctx: &TxContext) {
    assert!(pack.owner == ctx.sender(), ENotOwner);
    assert!(visibility <= VIS_PUBLIC, EInvalidVisibility);
    pack.visibility = visibility;
    event::emit(VisibilityChanged { pack_id: object::id(pack), visibility });
}

/// Transfer ownership to a new address.
public fun transfer_ownership(pack: ProofPack, new_owner: address, ctx: &TxContext) {
    assert!(pack.owner == ctx.sender(), ENotOwner);
    let pack_id = object::id(&pack);
    let from = pack.owner;
    let mut p = pack;
    p.owner = new_owner;
    event::emit(OwnershipTransferred { pack_id, from, to: new_owner });
    transfer::public_transfer(p, new_owner);
}

// === Read-only accessors (for tests + off-chain inspection) ===

public fun owner(p: &ProofPack): address { p.owner }
public fun manifest_blob_id(p: &ProofPack): &String { &p.manifest_blob_id }
public fun manifest_hash(p: &ProofPack): &vector<u8> { &p.manifest_hash }
public fun version(p: &ProofPack): u64 { p.version }
public fun visibility(p: &ProofPack): u8 { p.visibility }
public fun created_at_ms(p: &ProofPack): u64 { p.created_at_ms }
public fun registry_count(r: &Registry): u64 { r.count }

public fun vis_private(): u8 { VIS_PRIVATE }
public fun vis_unlisted(): u8 { VIS_UNLISTED }
public fun vis_public(): u8 { VIS_PUBLIC }

// === Test helpers ===

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) { init(ctx) }

#[test_only]
module sc::proofpack_tests;

use std::string;
use sui::clock;
use sui::test_scenario as ts;
use sc::proofpack::{Self, Registry, ProofPack};

const ALICE: address = @0xA11CE;
const BOB: address = @0xB0B;

fun fake_hash(): vector<u8> {
    let mut v = vector::empty<u8>();
    let mut i: u8 = 0;
    while (i < 32) {
        vector::push_back(&mut v, i);
        i = i + 1;
    };
    v
}

fun other_hash(): vector<u8> {
    let mut v = vector::empty<u8>();
    let mut i: u8 = 0;
    while (i < 32) {
        vector::push_back(&mut v, 255 - i);
        i = i + 1;
    };
    v
}

#[test]
fun test_create_pack_emits_and_increments_registry() {
    let mut scenario = ts::begin(ALICE);

    ts::next_tx(&mut scenario, ALICE);
    {
        proofpack::init_for_testing(ts::ctx(&mut scenario));
    };

    ts::next_tx(&mut scenario, ALICE);
    {
        let mut reg = ts::take_shared<Registry>(&scenario);
        let clk = clock::create_for_testing(ts::ctx(&mut scenario));
        proofpack::create(
            &mut reg,
            string::utf8(b"blob_abc_123"),
            fake_hash(),
            proofpack::vis_public(),
            &clk,
            ts::ctx(&mut scenario),
        );
        assert!(proofpack::registry_count(&reg) == 1, 100);
        clock::destroy_for_testing(clk);
        ts::return_shared(reg);
    };

    ts::next_tx(&mut scenario, ALICE);
    {
        let pack = ts::take_from_sender<ProofPack>(&scenario);
        assert!(proofpack::owner(&pack) == ALICE, 101);
        assert!(proofpack::version(&pack) == 1, 102);
        assert!(proofpack::visibility(&pack) == proofpack::vis_public(), 103);
        assert!(*proofpack::manifest_blob_id(&pack) == string::utf8(b"blob_abc_123"), 104);
        assert!(*proofpack::manifest_hash(&pack) == fake_hash(), 105);
        ts::return_to_sender(&scenario, pack);
    };

    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = sc::proofpack::EInvalidHashLength)]
fun test_create_rejects_bad_hash_length() {
    let mut scenario = ts::begin(ALICE);
    ts::next_tx(&mut scenario, ALICE);
    {
        proofpack::init_for_testing(ts::ctx(&mut scenario));
    };
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut reg = ts::take_shared<Registry>(&scenario);
        let clk = clock::create_for_testing(ts::ctx(&mut scenario));
        let short = vector[0u8, 1u8, 2u8];
        proofpack::create(
            &mut reg,
            string::utf8(b"blob_x"),
            short,
            proofpack::vis_private(),
            &clk,
            ts::ctx(&mut scenario),
        );
        clock::destroy_for_testing(clk);
        ts::return_shared(reg);
    };
    ts::end(scenario);
}

#[test]
fun test_update_version_links_previous() {
    let mut scenario = ts::begin(ALICE);
    ts::next_tx(&mut scenario, ALICE);
    {
        proofpack::init_for_testing(ts::ctx(&mut scenario));
    };

    ts::next_tx(&mut scenario, ALICE);
    {
        let mut reg = ts::take_shared<Registry>(&scenario);
        let clk = clock::create_for_testing(ts::ctx(&mut scenario));
        proofpack::create(
            &mut reg,
            string::utf8(b"blob_v1"),
            fake_hash(),
            proofpack::vis_unlisted(),
            &clk,
            ts::ctx(&mut scenario),
        );
        clock::destroy_for_testing(clk);
        ts::return_shared(reg);
    };

    ts::next_tx(&mut scenario, ALICE);
    {
        let prev = ts::take_from_sender<ProofPack>(&scenario);
        let clk = clock::create_for_testing(ts::ctx(&mut scenario));
        proofpack::update_version(
            prev,
            string::utf8(b"blob_v2"),
            other_hash(),
            &clk,
            ts::ctx(&mut scenario),
        );
        clock::destroy_for_testing(clk);
    };

    ts::next_tx(&mut scenario, ALICE);
    {
        let pack = ts::take_from_sender<ProofPack>(&scenario);
        assert!(proofpack::version(&pack) == 2, 200);
        assert!(*proofpack::manifest_blob_id(&pack) == string::utf8(b"blob_v2"), 201);
        ts::return_to_sender(&scenario, pack);
    };

    ts::end(scenario);
}

#[test]
fun test_set_visibility_owner_happy_path() {
    let mut scenario = ts::begin(ALICE);
    ts::next_tx(&mut scenario, ALICE);
    {
        proofpack::init_for_testing(ts::ctx(&mut scenario));
    };
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut reg = ts::take_shared<Registry>(&scenario);
        let clk = clock::create_for_testing(ts::ctx(&mut scenario));
        proofpack::create(
            &mut reg,
            string::utf8(b"blob_v1"),
            fake_hash(),
            proofpack::vis_private(),
            &clk,
            ts::ctx(&mut scenario),
        );
        clock::destroy_for_testing(clk);
        ts::return_shared(reg);
    };
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut pack = ts::take_from_sender<ProofPack>(&scenario);
        assert!(proofpack::visibility(&pack) == proofpack::vis_private(), 300);
        proofpack::set_visibility(&mut pack, proofpack::vis_public(), ts::ctx(&mut scenario));
        assert!(proofpack::visibility(&pack) == proofpack::vis_public(), 301);
        ts::return_to_sender(&scenario, pack);
    };
    ts::end(scenario);
}

#[test]
fun test_transfer_ownership_changes_owner() {
    let mut scenario = ts::begin(ALICE);
    ts::next_tx(&mut scenario, ALICE);
    {
        proofpack::init_for_testing(ts::ctx(&mut scenario));
    };
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut reg = ts::take_shared<Registry>(&scenario);
        let clk = clock::create_for_testing(ts::ctx(&mut scenario));
        proofpack::create(
            &mut reg,
            string::utf8(b"blob_v1"),
            fake_hash(),
            proofpack::vis_unlisted(),
            &clk,
            ts::ctx(&mut scenario),
        );
        clock::destroy_for_testing(clk);
        ts::return_shared(reg);
    };
    ts::next_tx(&mut scenario, ALICE);
    {
        let pack = ts::take_from_sender<ProofPack>(&scenario);
        proofpack::transfer_ownership(pack, BOB, ts::ctx(&mut scenario));
    };
    ts::next_tx(&mut scenario, BOB);
    {
        let pack = ts::take_from_sender<ProofPack>(&scenario);
        assert!(proofpack::owner(&pack) == BOB, 400);
        ts::return_to_sender(&scenario, pack);
    };
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = sc::proofpack::ENotOwner)]
fun test_transfer_ownership_rejects_non_owner() {
    let mut scenario = ts::begin(ALICE);
    ts::next_tx(&mut scenario, ALICE);
    {
        proofpack::init_for_testing(ts::ctx(&mut scenario));
    };
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut reg = ts::take_shared<Registry>(&scenario);
        let clk = clock::create_for_testing(ts::ctx(&mut scenario));
        proofpack::create(
            &mut reg,
            string::utf8(b"blob_v1"),
            fake_hash(),
            proofpack::vis_private(),
            &clk,
            ts::ctx(&mut scenario),
        );
        clock::destroy_for_testing(clk);
        ts::return_shared(reg);
    };
    ts::next_tx(&mut scenario, BOB);
    {
        let pack = ts::take_from_address<ProofPack>(&scenario, ALICE);
        proofpack::transfer_ownership(pack, BOB, ts::ctx(&mut scenario));
    };
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = sc::proofpack::ENotOwner)]
fun test_update_version_rejects_non_owner() {
    let mut scenario = ts::begin(ALICE);
    ts::next_tx(&mut scenario, ALICE);
    {
        proofpack::init_for_testing(ts::ctx(&mut scenario));
    };
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut reg = ts::take_shared<Registry>(&scenario);
        let clk = clock::create_for_testing(ts::ctx(&mut scenario));
        proofpack::create(
            &mut reg,
            string::utf8(b"blob_v1"),
            fake_hash(),
            proofpack::vis_private(),
            &clk,
            ts::ctx(&mut scenario),
        );
        clock::destroy_for_testing(clk);
        ts::return_shared(reg);
    };
    ts::next_tx(&mut scenario, BOB);
    {
        let pack = ts::take_from_address<ProofPack>(&scenario, ALICE);
        let clk = clock::create_for_testing(ts::ctx(&mut scenario));
        proofpack::update_version(
            pack,
            string::utf8(b"blob_v2_hack"),
            other_hash(),
            &clk,
            ts::ctx(&mut scenario),
        );
        clock::destroy_for_testing(clk);
    };
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = sc::proofpack::EInvalidVisibility)]
fun test_create_rejects_invalid_visibility() {
    let mut scenario = ts::begin(ALICE);
    ts::next_tx(&mut scenario, ALICE);
    {
        proofpack::init_for_testing(ts::ctx(&mut scenario));
    };
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut reg = ts::take_shared<Registry>(&scenario);
        let clk = clock::create_for_testing(ts::ctx(&mut scenario));
        proofpack::create(
            &mut reg,
            string::utf8(b"blob_bad_vis"),
            fake_hash(),
            99, // invalid visibility
            &clk,
            ts::ctx(&mut scenario),
        );
        clock::destroy_for_testing(clk);
        ts::return_shared(reg);
    };
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = sc::proofpack::ENotOwner)]
fun test_set_visibility_rejects_non_owner() {
    let mut scenario = ts::begin(ALICE);
    ts::next_tx(&mut scenario, ALICE);
    {
        proofpack::init_for_testing(ts::ctx(&mut scenario));
    };
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut reg = ts::take_shared<Registry>(&scenario);
        let clk = clock::create_for_testing(ts::ctx(&mut scenario));
        proofpack::create(
            &mut reg,
            string::utf8(b"blob_v1"),
            fake_hash(),
            proofpack::vis_private(),
            &clk,
            ts::ctx(&mut scenario),
        );
        clock::destroy_for_testing(clk);
        ts::return_shared(reg);
    };

    ts::next_tx(&mut scenario, BOB);
    {
        let mut pack = ts::take_from_address<ProofPack>(&scenario, ALICE);
        proofpack::set_visibility(&mut pack, proofpack::vis_public(), ts::ctx(&mut scenario));
        ts::return_to_address(ALICE, pack);
    };

    ts::end(scenario);
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { build, buildTrieResponse, decodeHexKey, decodeHexValue, rootHashHex } from '../src/engine/mpt.js';

test('Hex Bytes mode decodes hex into raw bytes before trie hashing', () => {
    const key = '11'.repeat(32);
    const value = '0xc20102';
    const result = buildTrieResponse({ [key]: value }, 'hex');
    const expected = '0x' + rootHashHex(build([[decodeHexKey(key), decodeHexValue(value)]]));
    assert.equal(result.computed_root, expected);
    assert.equal(result.root.value, value);
});

test('Hex Bytes and UTF-8 modes produce different roots for hex-looking input', () => {
    const entries = { ['22'.repeat(32)]: '0xc20102' };
    const rawBytesRoot = buildTrieResponse(entries, 'hex').computed_root;
    const utf8Root = buildTrieResponse(entries, 'utf8').computed_root;
    assert.notEqual(rawBytesRoot, utf8Root);
});

test('Hex Bytes mode rejects odd-length and non-hex values', () => {
    assert.throws(() => decodeHexValue('0xabc'), /even number/);
    assert.throws(() => decodeHexValue('0xzz'), /even number/);
    assert.deepEqual(decodeHexValue('0x'), []);
    assert.deepEqual(decodeHexValue('0xc20102'), [0xc2, 0x01, 0x02]);
});

test('Ethereum-style keys can be represented as exactly 32 bytes', () => {
    assert.equal(decodeHexKey('0x' + 'ab'.repeat(32)).length, 32);
});

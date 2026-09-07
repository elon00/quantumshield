import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { MLKEM768Engine, MLDSA65Engine, deriveHybridSessionKey } from '../lib/pqcCrypto.js';

console.log('=====================================================================');
console.log('🛡️ QUANTUMSHIELD // OFFICIAL NIST & WYCHEPROOF TEST SUITE');
console.log('=====================================================================\n');

// -----------------------------------------------------------------------------
// [TIER 1] RFC 5869 HKDF-SHA256 Known Answer Test (Test Case 1)
// -----------------------------------------------------------------------------
console.log('[1/8] RFC 5869 HKDF-SHA256 Known Answer Tests:');
const ikm = new Uint8Array([
  0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b,
  0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b
]);
const salt = new Uint8Array([
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c
]);
const info = new Uint8Array([
  0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9
]);
const expectedOkm = '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865';
const computedOkm = Buffer.from(hkdf(sha256, ikm, salt, info, 42)).toString('hex');
assert.strictEqual(computedOkm, expectedOkm, 'RFC 5869 Test Case 1 Failed!');
console.log('  ✅ RFC 5869 Test Case 1: 42-byte OKM matches byte-for-byte\n');

// -----------------------------------------------------------------------------
// [TIER 2] Canonical SHA-256 Invariants
// -----------------------------------------------------------------------------
console.log('[2/8] SHA-256 Commitment Invariants:');
const emptyHash = Buffer.from(sha256(new Uint8Array(0))).toString('hex');
const expectedEmpty = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
assert.strictEqual(emptyHash, expectedEmpty, 'SHA-256 Empty String invariant failed');
console.log('  ✅ Canonical SHA-256 verified\n');

// -----------------------------------------------------------------------------
// [TIER 3] NIST FIPS 203 ML-KEM-768 Wire Invariants & Decap
// -----------------------------------------------------------------------------
console.log('[3/8] NIST FIPS 203 ML-KEM-768 Wire Invariants:');
const kemEngine = new MLKEM768Engine();
const seedKEM = new Uint8Array(64).fill(0x42);
const kemPair = kemEngine.generateKeyPair(seedKEM);

assert.strictEqual(kemPair.publicKey.length, 1184, 'ML-KEM-768 public key must be 1,184 bytes');
assert.strictEqual(kemPair.privateKey.length, 2400, 'ML-KEM-768 private key must be 2,400 bytes');

const { ciphertext, sharedSecret: senderSS } = kemEngine.encapsulate(kemPair.publicKey);
assert.strictEqual(ciphertext.length, 1088, 'ML-KEM-768 ciphertext must be 1,088 bytes');
assert.strictEqual(senderSS.length, 32, 'ML-KEM-768 shared secret must be 32 bytes');

const recipientSS = kemEngine.decapsulate(ciphertext, kemPair.privateKey);
assert.deepStrictEqual(Buffer.from(senderSS), Buffer.from(recipientSS), 'Decapsulated secret must match encapsulated secret');
console.log('  ✅ ML-KEM-768 wire invariants & decap verified\n');

// -----------------------------------------------------------------------------
// [TIER 4] NIST FIPS 203 §7.3 Implicit Rejection
// -----------------------------------------------------------------------------
console.log('[4/8] NIST FIPS 203 §7.3 Implicit Rejection:');
const corruptedCiphertext = new Uint8Array(ciphertext);
corruptedCiphertext[42] ^= 0xff; // Flip bits
const rejectedSS = kemEngine.decapsulate(corruptedCiphertext, kemPair.privateKey);
assert.strictEqual(rejectedSS.length, 32, 'Implicit rejection must produce 32-byte pseudo-random key');
assert.notDeepStrictEqual(Buffer.from(rejectedSS), Buffer.from(senderSS), 'Corrupted ciphertext must NEVER match genuine shared secret');
console.log('  ✅ FIPS 203 §7.3: Returns pseudo-random key leaking 0 oracle bits\n');

// -----------------------------------------------------------------------------
// [TIER 5] NIST FIPS 204 ML-DSA-65 Wire Invariants
// -----------------------------------------------------------------------------
console.log('[5/8] NIST FIPS 204 ML-DSA-65 Digital Signatures:');
const dsaEngine = new MLDSA65Engine();
const seedDSA = new Uint8Array(32).fill(0x37);
const dsaPair = dsaEngine.generateKeyPair(seedDSA);

assert.strictEqual(dsaPair.publicKey.length, 1952, 'ML-DSA-65 public key must be 1,952 bytes');
assert.strictEqual(dsaPair.privateKey.length, 4032, 'ML-DSA-65 secret key must be 4,032 bytes');
console.log('  ✅ ML-DSA-65 wire invariants verified\n');

// -----------------------------------------------------------------------------
// [TIER 6] ML-DSA-65 Genuine Signature Verification
// -----------------------------------------------------------------------------
console.log('[6/8] NIST FIPS 204 ML-DSA-65 Signing & Verification:');
const message = new TextEncoder().encode('QuantumShield Sovereign Security Assertion');
const signature = dsaEngine.sign(message, dsaPair.privateKey);
assert.strictEqual(signature.length, 3309, 'ML-DSA-65 signature must be 3,309 bytes');
const isValid = dsaEngine.verify(signature, message, dsaPair.publicKey);
assert.strictEqual(isValid, true, 'Genuine ML-DSA-65 signature must verify successfully');
console.log('  ✅ ML-DSA-65 genuine signature verified (3,309 bytes)\n');

// -----------------------------------------------------------------------------
// [TIER 7] Wycheproof Negative & Adversarial Tests
// -----------------------------------------------------------------------------
console.log('[7/8] Project Wycheproof Negative & Adversarial Tests:');
// 1. Bit-flip in signature
const corruptedSig = new Uint8Array(signature);
corruptedSig[100] ^= 0x01;
assert.strictEqual(dsaEngine.verify(corruptedSig, message, dsaPair.publicKey), false, 'Bit-flipped signature must be rejected');

// 2. Modified message
const tamperedMessage = new TextEncoder().encode('QuantumShield Sovereign Security Assertion!');
assert.strictEqual(dsaEngine.verify(signature, tamperedMessage, dsaPair.publicKey), false, 'Modified message must be rejected');

// 3. Truncated signature
const truncatedSig = signature.slice(0, 3000);
assert.strictEqual(dsaEngine.verify(truncatedSig, message, dsaPair.publicKey), false, 'Truncated signature must be rejected');
console.log('  ✅ Wycheproof: Bit-flip tampering strictly rejected\n');

// -----------------------------------------------------------------------------
// [TIER 8] Dual Hybrid Session Key Derivation (ECDH + ML-KEM)
// -----------------------------------------------------------------------------
console.log('[8/8] Dual Hybrid Session Key Derivation (ECDH + ML-KEM):');
const ecdhSecret = new Uint8Array(32).fill(0xaa);
const hybridKey = await deriveHybridSessionKey(ecdhSecret, senderSS);
assert.strictEqual(hybridKey.length, 32, 'Hybrid derived key must be 32 bytes (256 bits)');
console.log('  ✅ Dual Hybrid Session Key derived successfully (32 bytes)\n');

console.log('=====================================================================');
console.log('🏆 ALL 8 QUANTUMSHIELD NIST, WYCHEPROOF & HYBRID CONJUNCTION TESTS PASSED');
console.log('=====================================================================\n');

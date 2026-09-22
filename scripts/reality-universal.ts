/**
 * QuantumShield repository-internal verification gates.
 *
 * Passing these checks demonstrates only the repository assertions below.
 * It is not an independent security audit, FIPS validation, production
 * certification, or proof that the current Express handshake implements ML-KEM.
 */
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';

interface Gate {
  gate: number;
  name: string;
  passed: boolean;
  details: string;
}

const gates: Gate[] = [];

function gate(name: string, check: () => void, details: string): void {
  const number = gates.length + 1;
  try {
    check();
    gates.push({ gate: number, name, passed: true, details });
    console.log(`[PASS ${number}] ${name}: ${details}`);
  } catch (error: any) {
    gates.push({
      gate: number,
      name,
      passed: false,
      details: error?.message || String(error),
    });
    console.error(`[FAIL ${number}] ${name}: ${error?.message || String(error)}`);
  }
}

console.log('QuantumShield — repository-internal verification gates');
console.log('Independent audit / FIPS validation / production certification: NOT CLAIMED');

gate(
  'Reality manifest',
  () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.resolve('REALITY_MANIFEST.json'), 'utf8')
    );
    assert.strictEqual(manifest.status, 'RESEARCH_PQC_INTEGRATION_PROTOTYPE');
    assert.strictEqual(manifest.truthTaxonomy.independentAudit, false);
    assert.strictEqual(manifest.truthTaxonomy.fipsValidatedModule, false);
    assert.strictEqual(manifest.truthTaxonomy.productionCertified, false);
    assert.strictEqual(manifest.truthTaxonomy.officialNistKatProvenance, false);
  },
  'machine-readable status keeps external certification claims false'
);

gate(
  'PQC library randomness boundary',
  () => {
    const cryptoFile = fs.readFileSync(path.resolve('src/lib/pqcCrypto.ts'), 'utf8');
    assert.ok(!cryptoFile.includes('Math.random()'));
  },
  'Math.random() is absent from the selected PQC library path'
);

let kemPair: ReturnType<typeof ml_kem768.keygen>;
gate(
  'ML-KEM-768 integration invariants',
  () => {
    kemPair = ml_kem768.keygen(new Uint8Array(64).fill(0x23));
    assert.strictEqual(kemPair.publicKey.length, 1184);
    assert.strictEqual(kemPair.secretKey.length, 2400);
    const enc = ml_kem768.encapsulate(kemPair.publicKey);
    assert.strictEqual(enc.cipherText.length, 1088);
    assert.strictEqual(enc.sharedSecret.length, 32);
    const dec = ml_kem768.decapsulate(enc.cipherText, kemPair.secretKey);
    assert.deepStrictEqual(Buffer.from(dec), Buffer.from(enc.sharedSecret));
  },
  'repository integration wire sizes and encapsulation/decapsulation passed'
);

gate(
  'ML-KEM corrupted-ciphertext behavior',
  () => {
    const pair = kemPair || ml_kem768.keygen(new Uint8Array(64).fill(0x23));
    const enc = ml_kem768.encapsulate(pair.publicKey);
    const bad = new Uint8Array(enc.cipherText);
    bad[15] ^= 0x55;
    const rejected = ml_kem768.decapsulate(bad, pair.secretKey);
    assert.strictEqual(rejected.length, 32);
    assert.notDeepStrictEqual(Buffer.from(rejected), Buffer.from(enc.sharedSecret));
  },
  'tested corrupted ciphertext produced a distinct 32-byte decapsulation result'
);

let dsaPair: ReturnType<typeof ml_dsa65.keygen>;
gate(
  'ML-DSA-65 integration invariants',
  () => {
    dsaPair = ml_dsa65.keygen(new Uint8Array(32).fill(0x89));
    assert.strictEqual(dsaPair.publicKey.length, 1952);
    assert.strictEqual(dsaPair.secretKey.length, 4032);
    const message = Buffer.from('QuantumShield integration gate');
    const signature = ml_dsa65.sign(message, dsaPair.secretKey);
    assert.strictEqual(signature.length, 3309);
    assert.strictEqual(ml_dsa65.verify(signature, message, dsaPair.publicKey), true);
    const bad = new Uint8Array(signature);
    bad[10] ^= 0xff;
    assert.strictEqual(ml_dsa65.verify(bad, message, dsaPair.publicKey), false);
  },
  'repository ML-DSA sign/verify and one tamper case passed'
);

gate(
  'RFC 5869 known-answer test',
  () => {
    const ikm = new Uint8Array(22).fill(0x0b);
    const salt = new Uint8Array([
      0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
      0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c,
    ]);
    const info = new Uint8Array([
      0xf0, 0xf1, 0xf2, 0xf3, 0xf4,
      0xf5, 0xf6, 0xf7, 0xf8, 0xf9,
    ]);
    const okm = Buffer.from(hkdf(sha256, ikm, salt, info, 42)).toString('hex');
    assert.strictEqual(
      okm,
      '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865'
    );
  },
  'RFC 5869 HKDF-SHA256 Test Case 1 passed'
);

gate(
  'Server handshake truth boundary',
  () => {
    const server = fs.readFileSync(path.resolve('server.ts'), 'utf8');
    assert.ok(server.includes('Placeholder PQ-shaped data'));
    assert.ok(server.includes('NOT ML-KEM'));
    assert.ok(server.includes('PRODUCTION_BLOCKED_PLACEHOLDER_PQC'));
    assert.ok(server.includes('if (IS_PRODUCTION)'));
    assert.ok(!server.includes('pqcStatus: "verified"'));
  },
  'server labels its PQ-shaped material as non-ML-KEM and blocks the placeholder handshake in production'
);

gate(
  'Demo payment truth boundary',
  () => {
    const payment = fs.readFileSync(
      path.resolve('src/components/PaymentGateway.tsx'),
      'utf8'
    );
    assert.ok(payment.includes('DEMONSTRATION ONLY'));
    assert.ok(payment.includes('NO REAL PAYMENT OR BLOCKCHAIN EXECUTION'));
    assert.ok(payment.includes('DEMO_NOT_CRYPTOGRAPHIC_'));
  },
  'financial demo does not claim real settlement or cryptographic signing'
);

const allPassed = gates.every((item) => item.passed);
fs.mkdirSync('reality', { recursive: true });
fs.writeFileSync(
  'reality/URS_SCORECARD.json',
  JSON.stringify(
    {
      system: 'QuantumShield',
      reportType: 'REPOSITORY_INTERNAL_VERIFICATION',
      timestamp: new Date().toISOString(),
      checksPassed: gates.filter((item) => item.passed).length,
      totalChecks: gates.length,
      independentAudit: false,
      fipsValidatedModule: false,
      productionCertification: false,
      serverMlKemHandshake: false,
      gates,
    },
    null,
    2
  )
);

console.log(
  allPassed
    ? 'INTERNAL CHECKS PASSED — NOT AN INDEPENDENT OR PRODUCTION CERTIFICATION'
    : 'INTERNAL CHECK FAILURE — inspect gate output'
);

if (!allPassed) process.exit(1);

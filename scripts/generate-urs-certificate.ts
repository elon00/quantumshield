/**
 * Generate a repository-internal signed evidence report.
 *
 * The ML-DSA signature authenticates this generated report only. It does not
 * make the report an independent audit, FIPS validation, legal certification,
 * or production-readiness certificate.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { sha256 } from '@noble/hashes/sha256';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';

function run(command: string, args: string[], title: string): void {
  console.log(`▶ ${title}`);
  try {
    execFileSync(command, args, { stdio: 'inherit' });
  } catch {
    console.error(`FAILED: ${title}`);
    process.exit(1);
  }
}

console.log('QuantumShield — generating repository-internal evidence report');

run(process.execPath, ['scripts/check-truth.cjs'], 'Truth verifier');
run(process.execPath, ['scripts/check-status.cjs'], 'Status verifier');
run('npx', ['tsc', '--noEmit'], 'TypeScript check');
run('npx', ['tsx', 'src/tests/official-nist-vectors.test.ts'], 'PQC integration/adversarial tests');
run(process.execPath, ['scripts/audit-crypto.mjs'], 'Cryptographic integration audit');
run('npx', ['tsx', 'scripts/reality-universal.ts'], 'Repository-internal verification gates');

const reporterSeed = new Uint8Array(32).fill(0xaa);
const reporter = ml_dsa65.keygen(reporterSeed);

const payload = {
  protocol: 'QuantumShield',
  reportType: 'REPOSITORY_INTERNAL_EVIDENCE',
  generatedAt: new Date().toISOString(),
  projectStatus: 'RESEARCH_PQC_INTEGRATION_PROTOTYPE',
  evidence: {
    applicationLayerMlKemIntegrationTested: true,
    applicationLayerMlDsaIntegrationTested: true,
    rfc5869KnownAnswerTested: true,
    repositoryAdversarialCasesTested: true,
    serverHandshakeUsesRealMlKem: false,
  },
  limitations: {
    independentVerification: false,
    externalSecurityAudit: false,
    fipsModuleValidation: false,
    officialNistPqcKatProvenance: false,
    wycheproofCorpusImported: false,
    productionCertification: false,
  },
  reporter: {
    signatureScheme: 'ML-DSA-65 integration',
    publicKeyHex: Buffer.from(reporter.publicKey).toString('hex'),
    note:
      'This key belongs to the repository-generated report process and is not an independent certification authority.',
  },
};

const canonical = Buffer.from(JSON.stringify(payload));
const sha256Hex = Buffer.from(sha256(canonical)).toString('hex');
const signatureHex = Buffer.from(
  ml_dsa65.sign(canonical, reporter.secretKey)
).toString('hex');

const report = { ...payload, sha256: sha256Hex, signatureHex };

fs.mkdirSync('reality', { recursive: true });
fs.mkdirSync('docs/reality', { recursive: true });
fs.writeFileSync(
  'reality/URS_EVIDENCE_CERTIFICATE.json',
  JSON.stringify(report, null, 2)
);

const markdown = `# QuantumShield — Internal Evidence Report

Generated: \`${payload.generatedAt}\`  
SHA-256: \`${sha256Hex}\`  
ML-DSA signature length: \`${signatureHex.length / 2} bytes\`

## Repository checks executed

- truth/status verification
- TypeScript type checking
- application-layer ML-KEM / ML-DSA integration checks
- repository-defined adversarial cases
- RFC 5869 HKDF known-answer test
- repository-internal reality gates

## Important boundary

The current Express \`/api/pqc/handshake\` uses real X25519 and HKDF but
**does not implement ML-KEM on the server**. It uses explicitly labeled
PQ-shaped placeholder data.

## Limitations

This report is created and signed by this repository. It is **not**:

- an independent security or cryptographic audit;
- FIPS validation of QuantumShield as a module;
- proof of official NIST PQC KAT/ACVP vector execution;
- proof that Project Wycheproof vectors were imported;
- a production-readiness certificate.

The ML-DSA signature authenticates the generated report only.
`;

fs.writeFileSync('docs/reality/URS_EVIDENCE_CERTIFICATE.md', markdown);

console.log('Internal evidence report generated');
console.log(`SHA-256: ${sha256Hex}`);
console.log('Independent verification: NOT CLAIMED');
console.log('Production certification: NOT CLAIMED');

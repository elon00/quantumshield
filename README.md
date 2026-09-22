# QuantumShield

Post-quantum migration research prototype combining a real application-layer ML-KEM/ML-DSA library integration with an intentionally limited server-side handshake demonstration.

## Reality-first status

**RESEARCH / PQC INTEGRATION PROTOTYPE — NOT CRYPTOGRAPHICALLY CERTIFIED OR PRODUCTION-READY**

QuantumShield currently has two distinct cryptographic surfaces that must not be conflated:

1. **Application/client library:** `src/lib/pqcCrypto.ts` uses `@noble/post-quantum` for ML-KEM-768 and ML-DSA-65, with repository tests for wire sizes, encapsulation/decapsulation, signing/verification, tamper rejection, HKDF and AES-GCM helpers.
2. **Express server handshake:** `/api/pqc/handshake` currently performs real X25519 + HKDF-SHA256 but uses explicitly labeled random PQ-shaped placeholder material. It is **not** an ML-KEM server handshake.

### What is evidenced

- ML-KEM-768 application-layer integration through `@noble/post-quantum`
- ML-DSA-65 application-layer integration through `@noble/post-quantum`
- repository tests for selected wire/integration/adversarial properties
- X25519 key agreement using Node `crypto`
- RFC 5869 HKDF-SHA256 known-answer testing
- AES-256-GCM browser helper code
- Express API and React/Vite application
- optional server-side Gemini integration
- truth/config/release checks and locked npm dependencies

### What is not claimed

- FIPS validation of QuantumShield as a cryptographic module
- independent cryptographic or application security audit
- official NIST ACVP/KAT provenance for locally constructed ML-KEM/ML-DSA test seeds
- Project Wycheproof corpus execution unless actual Wycheproof vectors are imported and identified
- production ML-KEM on the current server handshake
- whole-system “quantum safe” certification
- real payment settlement, insured balances, grants, exchanges, or financial custody from demo screens
- production deployment merely because a hosting workflow succeeds

## Verification

```bash
npm ci
npm test
```

The verification pipeline checks truth/configuration, cryptographic integration tests, the internal evidence gates, TypeScript and the production build.

A green repository test proves the covered assertions only. It is not an independent certification.

## Secure configuration

Copy `.env.example` to `.env.local` and keep real credentials out of Git:

```env
GEMINI_API_KEY=
GEMINI_MODEL=
APP_URL=http://localhost:3000
PORT=3000
```

Gemini is optional. If no key/model is configured, AI output must remain explicitly labeled as a fallback/demo path.

## Server handshake boundary

The current server endpoint reports:

- real X25519 agreement when a valid client public key is supplied;
- real HKDF-SHA256 derivation;
- placeholder PQ-shaped data for architecture demonstration.

The placeholder path must never be described as server-side ML-KEM. A production hybrid protocol should use a reviewed, interoperable ML-KEM implementation on both sides, authenticate the transcript, bind roles/context, define key confirmation and failure behavior, and undergo independent protocol review.

## Demo/financial surfaces

Payment, exchange, grant, token and wallet-like screens are demonstrations unless backed by an actual authorized provider/network integration. Generated local IDs or random receipt tags are not blockchain transaction hashes or cryptographic signatures.

## AI migration assessment

The AI audit/report UI is an **internal migration-readiness assessment tool**, not an independent auditor, compliance certificate, NIST validation, or professional legal/security opinion.

## Deployment

GitHub deployment requires valid Netlify credentials in Actions secrets. A successful static/web deployment demonstrates hosting only; it does not demonstrate cryptographic production readiness.

## Security

See [SECURITY.md](SECURITY.md) and [SECURITY_STATUS.md](SECURITY_STATUS.md).

## Production-readiness gate

Before calling QuantumShield production-ready, require at minimum:

1. real interoperable ML-KEM in the server protocol;
2. authenticated transcript/key-confirmation design and protocol threat model;
3. independent cryptographic/security review;
4. official vector provenance where specific conformance claims are made;
5. API authentication/authorization for sensitive operations;
6. managed secrets and key lifecycle;
7. monitoring, alerting, incident response and rollback;
8. load/failure testing under a documented workload;
9. deployment-specific privacy/compliance review.

## License

Use the repository's checked-in license terms.

# QuantumShield Security and Evidence Status

## Current status

**RESEARCH / PROTOTYPE — NOT CRYPTOGRAPHICALLY CERTIFIED**

### Implemented and evidenced in source
- Node.js/Express API structure.
- X25519 key-agreement path using Node crypto.
- HKDF-SHA256 derivation in the handshake flow.
- Server-side optional Gemini integration.
- Netlify build and function routing configuration.

### Not yet evidenced as production cryptography
- ML-KEM-768 key generation, encapsulation and decapsulation.
- ML-DSA signing or verification.
- Hybrid X25519 + ML-KEM interoperability.
- NIST validation or certification.
- Independent cryptographic audit.
- Production security certification.

## Release rule

Do not describe a release as **quantum-safe**, **production-verified**, **NIST-compliant**, or **cryptographically audited** unless reproducible evidence supporting that exact claim is published.

## Required evidence for PQC release

1. Reviewed implementation or dependency provenance.
2. Version-pinned dependency lockfile.
3. Official or independently validated test vectors.
4. Positive interoperability tests.
5. Negative and tamper tests.
6. Hybrid key-agreement equality tests.
7. Failure-path and input-validation tests.
8. Independent cryptographic review.

Until then, use the status: **PROTOTYPE / RESEARCH / UNVERIFIED**.

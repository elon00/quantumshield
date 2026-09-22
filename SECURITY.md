# Security Policy

## Project status

QuantumShield is a post-quantum migration **research / integration prototype**. It is not an independently audited or FIPS-validated production cryptographic module.

## Reporting

Please use GitHub's private security-reporting facilities when available. Do not publish credentials, private keys, seed phrases, exploitable endpoint details, personal data, or active provider tokens in public issues.

Include:

- affected commit/version;
- affected endpoint/component;
- reproduction steps;
- expected vs actual behavior;
- security impact;
- suggested mitigation when known.

## High-risk areas

Extra review is required for:

- `src/lib/pqcCrypto.ts`;
- the X25519/PQ handshake in `server.ts`;
- key/secret handling;
- AI-provider credential handling;
- Firestore rules and persisted demo data;
- any future payment, wallet, exchange or settlement integration.

## Current cryptographic boundary

- application-layer ML-KEM-768 and ML-DSA-65 integrations are repository-tested;
- the current Express handshake does **not** implement server-side ML-KEM;
- repository tests are not FIPS validation;
- repository-defined adversarial cases are not Project Wycheproof unless actual vectors are imported and identified;
- generated internal evidence reports are not external certification.

## Secrets

Never commit:

- Gemini/API credentials;
- Netlify credentials;
- Firebase service-account credentials;
- private keys or wallet seeds;
- production user/customer data.

## Production prerequisites

Independent security review, a reviewed interoperable hybrid protocol, managed key/secrets lifecycle, authenticated sensitive APIs, monitoring/incident response, release/rollback procedures and deployment-specific threat modeling are required before production use.

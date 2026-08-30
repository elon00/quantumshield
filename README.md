# QuantumShield

## Reality-first status

QuantumShield is a **post-quantum migration research prototype**. Its current checked-in server contains a real X25519 + HKDF path and a separately labeled placeholder PQ layer used to demonstrate architecture. Cryptographic production readiness requires a real reviewed ML-KEM implementation, reproducible tests, and independent review.

### What is verified in this repository
- Node/Express server with `/api/health`, PQC handshake, benchmark and key-analysis endpoints.
- X25519 key agreement and HKDF-SHA256 are implemented with Node `crypto`.
- Gemini integration is server-side and activated only when `GEMINI_API_KEY` is configured.
- Netlify build configuration is present for a Vite build and serverless API routing.
- Firestore security rules and a security specification are included.

### What is **not** claimed yet
- The current PQC handshake is **not a verified ML-KEM-768 implementation**. The checked-in handshake currently uses generated placeholder ciphertext/shared-secret material for the ML-KEM portion and must not be represented as production ML-KEM.
- QuantumShield does not provide proof of quantum-resistant security merely from its name or benchmark UI.
- Benchmark timings and security-bit labels are informational until reproduced by a controlled benchmark suite.
- A deployed Netlify site is not, by itself, evidence of cryptographic correctness.

## Secure configuration

Copy `.env.example` to a local environment file. **Never commit real API keys or credentials.**

```env
GEMINI_API_KEY=
GEMINI_MODEL=
APP_URL=http://localhost:3000
PORT=3000
```

Gemini is optional for the AI audit endpoint; without a key, the endpoint should clearly identify its response as an offline fallback rather than pretending an external model was used.

## Local development

```bash
npm install
npm run lint
npm run build
npm run dev
```

## Current deployment status

The source repository can pass its CI and release gates independently of external hosting credentials. The GitHub Actions production deployment additionally requires a valid `NETLIFY_SITE_ID`; without that repository secret, deployment is intentionally stopped before contacting a Netlify site. This is an external configuration prerequisite, not evidence of a successful production deployment.

## Deployment prerequisites

The GitHub deployment workflow requires repository secrets named:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

The repository code cannot safely infer or fabricate these credentials. Keep them in GitHub Actions secrets and never commit them to source control.

## Evidence gates

Before calling QuantumShield production-ready, the following must pass:

1. Reproducible dependency installation from the committed lockfile.
2. Typecheck and production build.
3. Real ML-KEM-768 key generation, encapsulation and decapsulation using a reviewed implementation or library.
4. Known-answer/vector tests and negative/tamper tests.
5. Hybrid X25519 + ML-KEM key agreement test proving both peers derive the same key.
6. API integration and failure-path tests.
7. Security-rule tests for Firestore.
8. Independent review of cryptographic choices and parameter claims.

## Threat-model principles

- Classical RSA/ECC exposure to Shor's algorithm must be described accurately and without speculative timelines being presented as facts.
- “Post-quantum” means the relevant primitive and implementation have evidence; it is not a marketing label.
- Simulations, placeholders and fallback responses must remain explicitly labeled.

## Security specification

See [`security_spec.md`](security_spec.md) for data invariants and negative security scenarios.

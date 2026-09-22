# QuantumShield Security and Evidence Status

## Current status

**RESEARCH / PQC INTEGRATION PROTOTYPE — NOT CRYPTOGRAPHICALLY CERTIFIED**

## Verification matrix

| Claim | Current evidence |
|---|---|
| ML-KEM-768 application-layer integration | Repository-tested through `@noble/post-quantum`; application is not FIPS-validated |
| ML-DSA-65 application-layer integration | Repository-tested through `@noble/post-quantum`; application is not FIPS-validated |
| X25519 + HKDF server path | Implemented in Node `crypto` |
| Server-side ML-KEM handshake | **Not implemented**; current server uses explicitly labeled PQ-shaped placeholder material |
| Hybrid helper logic | Client/library derivation helper is repository-tested; production protocol interoperability is not independently verified |
| Official NIST ACVP/KAT vectors | **Not claimed** for locally generated PQC seeds |
| Project Wycheproof corpus | **Not claimed** |
| Independent cryptographic audit | **Not completed** |
| Production security certification | **Not claimed** |
| Production deployment | Hosting/deploy workflows do not establish cryptographic production readiness |

## Release rule

Do not describe a release as **quantum-safe**, **FIPS validated**, **independently audited**, **production certified**, or as implementing server-side ML-KEM unless evidence supports that exact claim.

## Required evidence for production PQC

1. reviewed dependency/implementation provenance;
2. locked, reproducible builds;
3. official/identified vector sources for claims that depend on them;
4. positive/negative interoperability tests;
5. full server-side ML-KEM protocol implementation;
6. transcript binding, authentication and key confirmation;
7. independent security/cryptographic review;
8. deployment threat model, secrets management and operational controls.

Until those requirements are satisfied, use: **RESEARCH / PQC INTEGRATION PROTOTYPE**.

#!/usr/bin/env node
const fs = require("fs");
const targets = [
  "README.md",
  "server.ts",
  "src/App.tsx",
  "src/components/KeyExchangeSandbox.tsx",
  "src/components/CryptoExchangeHub.tsx",
  "src/components/PaymentGateway.tsx"
];
const forbidden = [
  /production[- ]verified ML-KEM/i,
  /real quantum hardware/i,
  /guaranteed quantum[- ]resistant/i,
  /Compliant with NIST FIPS 203.*CNSA 2\.0/i,
  /pqcStatus:\s*"verified"/i,
  /ML-KEM-768 Encapsulation on server/i,
  /status:\s*"key_exchanged"/,
  /modern post-quantum primitives.*conforming to NIST FIPS 203/i,
  /quantumResistanceScore:\s*[1-9]/i,
  /quantumBits:\s*[1-9]/i,
  /100% quantum-safe/i,
  /ML-DSA-65 SIGNED/i,
  /Successfully swapped .*PQC Protected/i,
  /ML-KEM-768 SIGNED/i,
  /FDIC \+ PQC Vault Insured/i,
  /NIST PQC Migration Reserve/i,
  /successfully authorized and broadcast with NIST ML-KEM/i
];
let failed = false;
for (const file of targets) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const rule of forbidden) {
    if (rule.test(text)) {
      console.error(`TRUTH CHECK FAIL: ${file} matches ${rule}`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log("TRUTH CHECK PASS: unsupported production and PQC claims are blocked.");

#!/usr/bin/env node
const fs = require("fs");
const status = fs.readFileSync("SECURITY_STATUS.md", "utf8");
const required = [
  "RESEARCH / PROTOTYPE — NOT CRYPTOGRAPHICALLY CERTIFIED",
  "ML-KEM-768 | Not evidenced as implemented",
  "ML-DSA | Not evidenced as implemented",
  "Hybrid PQC interoperability | Not evidenced",
  "Cryptographic audit | Not evidenced",
  "Production deployment | Not evidenced by CI alone"
];
for (const item of required) {
  if (!status.includes(item)) {
    console.error("STATUS CHECK FAIL: missing required evidence statement:", item);
    process.exit(1);
  }
}
console.log("STATUS CHECK PASS: published security claims remain aligned with current evidence.");

#!/usr/bin/env node
const fs = require("fs");
const status = fs.readFileSync("SECURITY_STATUS.md", "utf8");
const required = [
  "RESEARCH / PQC INTEGRATION PROTOTYPE — NOT CRYPTOGRAPHICALLY CERTIFIED",
  "ML-KEM-768 application-layer integration",
  "ML-DSA-65 application-layer integration",
  "Server-side ML-KEM handshake | **Not implemented**",
  "Official NIST ACVP/KAT vectors | **Not claimed**",
  "Independent cryptographic audit | **Not completed**",
  "Production security certification | **Not claimed**"
];
for (const item of required) {
  if (!status.includes(item)) {
    console.error("STATUS CHECK FAIL: missing required evidence statement:", item);
    process.exit(1);
  }
}
console.log("STATUS CHECK PASS: published security claims remain aligned with current evidence.");

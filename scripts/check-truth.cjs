#!/usr/bin/env node
const fs = require("fs");
const targets = ["README.md", "server.ts"];
const forbidden = [
  /production[- ]verified ML-KEM/i,
  /real quantum hardware/i,
  /guaranteed quantum[- ]resistant/i
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
console.log("TRUTH CHECK PASS: no forbidden unsupported production claims found.");

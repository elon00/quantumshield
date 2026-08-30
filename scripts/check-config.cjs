#!/usr/bin/env node
const fs = require("fs");
const required = [
  ".env.example",
  "netlify.toml",
  "scripts/check-truth.cjs",
  "scripts/check-lock.cjs",
  "SECURITY_STATUS.md",
  "security_spec.md"
];
for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error("CONFIG CHECK FAIL: missing " + file);
    process.exit(1);
  }
}
const netlify = fs.readFileSync("netlify.toml", "utf8");
if (!/command\s*=\s*"npm run build"/.test(netlify) || !/publish\s*=\s*"dist"/.test(netlify)) {
  console.error("CONFIG CHECK FAIL: Netlify build/publish configuration is incomplete");
  process.exit(1);
}
const envExample = fs.readFileSync(".env.example", "utf8");
for (const key of ["GEMINI_API_KEY=", "GEMINI_MODEL=", "APP_URL=", "PORT="]) {
  if (!envExample.includes(key)) {
    console.error("CONFIG CHECK FAIL: missing environment template key " + key);
    process.exit(1);
  }
}
if (!envExample.includes("GEMINI_API_KEY=")) {
  console.error("CONFIG CHECK FAIL: safe Gemini environment template is missing");
  process.exit(1);
}
console.log("CONFIG CHECK PASS: required release configuration and security evidence files are present.");

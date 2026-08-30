#!/usr/bin/env node
const fs = require("fs");
const required = [".env.example", "netlify.toml", "scripts/check-truth.cjs"];
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
console.log("CONFIG CHECK PASS: required release configuration is present.");

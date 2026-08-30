#!/usr/bin/env node
const fs = require("fs");

const trackedEnvFiles = [".env", ".env.local"];
for (const file of trackedEnvFiles) {
  if (fs.existsSync(file)) {
    console.error("ENV CHECK FAIL: local secret file exists in working tree: " + file);
    process.exit(1);
  }
}

const requiredIgnorePatterns = [".env*"];
if (!fs.existsSync(".gitignore")) {
  console.error("ENV CHECK FAIL: .gitignore is missing");
  process.exit(1);
}
const ignored = fs.readFileSync(".gitignore", "utf8");
for (const pattern of requiredIgnorePatterns) {
  if (!ignored.includes(pattern)) {
    console.error("ENV CHECK FAIL: .gitignore is missing " + pattern);
    process.exit(1);
  }
}

console.log("ENV CHECK PASS: secret environment files are protected by repository policy.");

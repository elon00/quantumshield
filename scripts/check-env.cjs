#!/usr/bin/env node
const fs = require("fs");

const forbiddenTracked = [".env"];
const requiredIgnored = [".env", ".env.local", ".env.*.local"];

for (const file of forbiddenTracked) {
  if (fs.existsSync(file)) {
    console.error("ENV CHECK FAIL: local secret file exists in repository working tree: " + file);
    console.error("Use environment variables and never commit secrets.");
    process.exit(1);
  }
}

if (fs.existsSync(".gitignore")) {
  const ignored = fs.readFileSync(".gitignore", "utf8");
  for (const pattern of requiredIgnored) {
    if (!ignored.includes(pattern)) {
      console.error("ENV CHECK FAIL: .gitignore is missing " + pattern);
      process.exit(1);
    }
  }
}

console.log("ENV CHECK PASS: no committed local .env file is required by this gate.");

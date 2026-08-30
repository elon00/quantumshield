#!/usr/bin/env node
const fs = require("fs");
const child = require("child_process");

if (!fs.existsSync(".gitignore")) {
  console.error("ENV CHECK FAIL: .gitignore is missing");
  process.exit(1);
}
const ignored = fs.readFileSync(".gitignore", "utf8");
if (!ignored.includes(".env*")) {
  console.error("ENV CHECK FAIL: .gitignore must protect .env* files");
  process.exit(1);
}

const tracked = child.execSync("git ls-files -- .env .env.local .env.production .env.development", {encoding:"utf8"}).trim();
if (tracked) {
  console.error("ENV CHECK FAIL: tracked environment files detected:\n" + tracked);
  process.exit(1);
}
console.log("ENV CHECK PASS: environment secret files are ignored and not tracked.");

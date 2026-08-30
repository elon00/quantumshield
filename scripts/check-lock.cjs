#!/usr/bin/env node
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
if (lock.name !== pkg.name || lock.packages?.[""]?.name !== pkg.name) {
  console.error("LOCK CHECK FAIL: package-lock root name does not match package.json. Run npm install and commit the regenerated lockfile.");
  process.exit(1);
}
console.log("LOCK CHECK PASS: package and lockfile identity match.");

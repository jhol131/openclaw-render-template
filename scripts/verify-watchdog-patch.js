const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const alphaPackage = require(path.join(
  root,
  "node_modules/@chrysb/alphaclaw/package.json",
));
const openclawPackage = require(path.join(root, "node_modules/openclaw/package.json"));
const watchdogPath = path.join(
  root,
  "node_modules/@chrysb/alphaclaw/lib/server/watchdog.js",
);
const watchdogSource = fs.readFileSync(watchdogPath, "utf8");
const migrationSource = fs.readFileSync(
  path.join(
    root,
    "node_modules/@chrysb/alphaclaw/lib/server/openclaw-codex-migration.js",
  ),
  "utf8",
);
const preflightSource = fs.readFileSync(
  path.join(
    root,
    "node_modules/@chrysb/alphaclaw/lib/server/openclaw-doctor-preflight.js",
  ),
  "utf8",
);

const requiredSnippets = [
  "autoRepairPaused: false",
  'reason: "max_attempts_reached"',
  'notifyOncePerIncident(\n          "auto_repair_paused"',
  "autoRepairPaused: state.autoRepairPaused",
];

if (alphaPackage.version !== "0.9.36") {
  throw new Error(`unexpected AlphaClaw version: ${alphaPackage.version}`);
}
if (openclawPackage.version !== "2026.9.8") {
  throw new Error(`unexpected OpenClaw version: ${openclawPackage.version}`);
}
for (const snippet of requiredSnippets) {
  if (!watchdogSource.includes(snippet)) {
    throw new Error(`watchdog hardening missing: ${snippet}`);
  }
}
for (const snippet of [
  'prefix: ["doctor-auth-flat-profiles", "auth-profile-repair"]',
  'typeof authApi.repairAuthProfileMigration === "function"',
  'throw new Error("OpenClaw auth migration API is incomplete")',
]) {
  if (!migrationSource.includes(snippet)) {
    throw new Error(`OpenClaw compatibility hardening missing: ${snippet}`);
  }
}
for (const snippet of [
  "ALPHACLAW_OPENCLAW_DOCTOR_TIMEOUT_MS",
  "600_000",
  "timeout: doctorTimeoutMs",
]) {
  if (!preflightSource.includes(snippet)) {
    throw new Error(`large-database preflight hardening missing: ${snippet}`);
  }
}

console.log(
  `verified AlphaClaw ${alphaPackage.version}, OpenClaw ${openclawPackage.version}, watchdog circuit breaker, migration compatibility, and large-database preflight timeout`,
);

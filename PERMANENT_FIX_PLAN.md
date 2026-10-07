# Main JBA Permanent Runtime Fix

## Scope

- Upgrade AlphaClaw from `0.9.18` to `0.9.36`.
- Upgrade OpenClaw from `2026.6.11` to `2026.9.8`.
- Move the image from Node 22 to the supported Node `24.16` runtime.
- Patch the AlphaClaw watchdog so failed repair attempts stop at the configured maximum and the terminal alert is emitted once per incident.
- Patch AlphaClaw's Codex auth migration adapter for OpenClaw `2026.9.8`, whose auth migration exports changed after `2026.9.3`.
- Extend AlphaClaw's Doctor preflight timeout from 150 seconds to a configurable 600-second default so large persistent SQLite databases can complete integrity verification during upgrades.
- Preserve and archive the two retired Telegram JSON files that OpenClaw `2026.9.8` refuses after the canonical SQLite migration is already complete, preventing replay ambiguity without deleting their bytes.

## Why Capacity Is Unchanged

Main JBA already runs on Render Pro Plus with 8 GB RAM and 4 CPU. Incident RSS was about 1.4 GB. The observed failure is Gateway heap and event-loop pressure plus an unbounded watchdog repair loop, not platform RAM exhaustion.

## T0 Validation

1. Build the image from this branch.
2. Confirm build-time `verify:watchdog-patch` passes.
3. Restore a non-production copy of the current configuration and persistent state.
4. Run OpenClaw configuration migration and validation.
5. Prove model routing, Telegram delivery, cron visibility, memory search, post-office access, and gateway health.
6. Confirm two forced repair failures produce two repair commands, one terminal alert, `autoRepairPaused=true`, and no later repair command until manual action or verified recovery.

Behavioral test patches are stored under `patches/*.test.patch`. The exact Node 24, AlphaClaw `0.9.36`, OpenClaw `2026.9.8`, and both production patches passed AlphaClaw's full upstream suite: 764 tests across 107 files.

## Known Upstream Security Gate

`npm audit --omit=dev` currently reports six high advisories inherited from the latest OpenClaw/AlphaClaw dependency graph, including the MCP SDK OAuth authorization-server advisory. NPM's suggested automatic fix incorrectly downgrades OpenClaw and AlphaClaw, so no forced audit rewrite is permitted. Before production, review whether JBA connects to any untrusted MCP authorization server and re-check whether a fixed OpenClaw release is available.

## Production Gate

Production deployment requires a separate Jimmy approval after T0 evidence is presented. Before deployment, record the current Render deploy identifier and repository SHA `da738e834773c9ff2feb34f29440d5b95d4e68a2` as the rollback target.

## Rollback

Redeploy the prior Render image tied to repository SHA `da738e834773c9ff2feb34f29440d5b95d4e68a2`. Restore persistent state only if the migration changed it and the migration-specific rollback requires restoration.

## Proof Ladder

- `CONFIGURED`: image builds with pinned versions and verified patch.
- `ALIVE`: real post-deploy turn, Telegram delivery, health checks, and runtime version proof.
- `DURABLE`: survives restart plus D+1 verification.
- `VERIFIED`: seven-day VEE review confirms bounded heap, no alert storm, and acceptable cost.

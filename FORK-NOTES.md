# OpenWhispr Custom Fork — Maintenance Notes

Custom builds track upstream releases plus local enhancements (note transcript
editing/selection transfer, per-scope and per-action temperature, long-note
batching, offline-local policy behavior, native PTT hardening).

## Versioning

Custom releases are suffixed: `1.10.2-custom.1`, `1.10.2-custom.2`, …

- Bump `package.json` AND the two `version` fields at the top of
  `package-lock.json` (root + `packages[""]`). Keep them in sync.
- Always use Node 24 for `npm install` (matches CI; other majors rewrite the
  lockfile incompatibly).
- Semver reads `1.10.2-custom.1` as OLDER than stock `1.10.2`, so the stock
  updater will always offer to "upgrade" (downgrade) the custom build away.
  Keep Automatic updates OFF in Settings → System on custom builds, and never
  accept a manual stock update inside one.

## Building a custom release

1. `npm install` (Node 24). A missing dep (e.g. `remark-gfm`) means the tree
   was never fully installed — typecheck will tell you.
2. `npm run typecheck` — must be clean.
3. Run the affected unit tests (`node --import tsx --test test/...`).
4. Back up live data first:
   `%AppData%/open-whispr/transcriptions.db*` (+ `.env`) for packaged builds,
   `%AppData%/OpenWhispr-development/transcriptions-dev.db*` for dev-channel.
5. `npm run pack -- --config.directories.output=dist/custom-<ver>`
   (e.g. `dist/custom-1.10.2`). Prepack downloads sidecars automatically.
   **Build env (REQUIRED for any cloud/account feature):** official builds
   inject `VITE_OPENWHISPR_API_URL`, `VITE_AUTH_URL`, and
   `VITE_OPENWHISPR_OAUTH_CALLBACK_URL` at build time (see
   `.github/workflows/release.yml`); they are baked into
   `src/dist/runtime-env.json`. A local `npm run pack` without them produces
   a build with no API URL: sign-in works (auth URL has a hardcoded
   fallback) but every cloud call fails with
   `OpenWhispr API URL not configured` — workspace policy fetch fails, the
   onboarding setup step dead-ends at "No setup option is available", and
   signed-in account notes never sync. Always build as:
   `VITE_OPENWHISPR_API_URL=https://api.openwhispr.com VITE_AUTH_URL=https://auth.openwhispr.com npm run pack -- --config.directories.output=dist/custom-<ver>`
   (PowerShell: `$env:VITE_OPENWHISPR_API_URL="https://api.openwhispr.com"; ...`).
   Emergency workaround without rebuilding: add
   `OPENWHISPR_API_URL=https://api.openwhispr.com` to
   `%AppData%/open-whispr/.env` (loaded into `process.env` at startup,
   checked first by `getApiUrl` in `ipcHandlers.js`).
6. **Known packaging gap (as of 1.10.2):** `win-unpacked/resources/bin/` is
   missing `windows-key-listener.exe`, `windows-mic-listener.exe`,
   `windows-system-audio-helper.exe`, `windows-text-monitor.exe` even though
   the `extraResources` filter lists them. Without the key listener,
   modifier-only push-to-talk hotkeys (e.g. `Control+Super`) silently do
   nothing (`Native key listener unavailable - falling back to toggle mode`
   in the debug log). After every pack, copy the four exes from
   `resources/bin/` into the unpacked `resources/bin/` (refresh via
   `scripts/download-windows-*.js` if stale).
7. Point `OpenWhispr-Custom-Launcher.cmd` at the new
   `dist/custom-<ver>/win-unpacked/OpenWhispr.exe`. Keep the previous
   `dist/custom-*` dir as rollback. The launcher is untracked by git.

## Upgrade workflow (new upstream tag)

1. `git fetch upstream --tags`.
2. New branch off the upstream tag: `upgrade/vX.Y.Z-preserve-note-custom`.
3. Re-apply the custom commit set on top (temperature, batching, transcript
   editing/transfer/import, latency, policy — see `git log` on the previous
   upgrade branch). Prefer `git cherry-pick -n` per topical commit; every
   file the custom touches AND upstream redesigned needs manual review.
4. Before porting a customization, check whether upstream absorbed it
   (this happened with stale-local-model cleanup, date-bucket grouping, and
   local-model context sizing in 1.10.x — all skipped as superseded).
5. Never silently weaken `src/stores/policyRules.ts` enforcement: local-mode
   conveniences must yield to an explicit managed policy (see narrowing in
   `isLlmSelectionAllowed` / `isTranscriptionSelectionAllowed` /
   `assertAgentSessionAllowedByPolicy`).
6. Upstream UX decisions that conflict with old customs (e.g. 1.10.1 default
   note tab) stay upstream unless explicitly re-decided; capabilities
   (edit/select/transfer/import) are always preserved.
7. Push the branch to `origin` (fork backup) and build per above.

## Debug log location (Windows, packaged build)

`%AppData%/open-whispr/logs/debug-<timestamp>.log` — grep for
`Push-to-Talk`, `HotkeyManager`, `windows-key-listener` when hotkeys fail.

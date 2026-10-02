const CANONICAL_APP_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

// Fork builds carry a "-custom.N" suffix (e.g. "1.10.2-custom.2") for local
// traceability. Policy-gated cloud requests must advertise the canonical
// upstream base they remain capability-compatible with.
const FORK_VERSION_SUFFIX = /-custom\.\d+$/;

function toCanonicalBaseAppVersion(value) {
  if (typeof value !== "string") return null;
  const base = value.replace(FORK_VERSION_SUFFIX, "");
  return CANONICAL_APP_VERSION.test(base) ? base : null;
}

function parseCanonicalAppVersion(value) {
  if (typeof value !== "string") return null;
  const match = CANONICAL_APP_VERSION.exec(value);
  if (!match) return null;
  const parts = match.slice(1).map(Number);
  return parts.every(Number.isSafeInteger) ? parts : null;
}

function isCanonicalAppVersion(value) {
  return parseCanonicalAppVersion(value) !== null;
}

module.exports = { isCanonicalAppVersion, parseCanonicalAppVersion, toCanonicalBaseAppVersion };

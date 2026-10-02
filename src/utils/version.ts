const CANONICAL_APP_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

// Fork builds carry a "-custom.N" suffix (e.g. "1.10.2-custom.2"). Version
// *comparisons* treat a fork build as its canonical upstream base, while
// isCanonicalAppVersion above stays strict by design.
const FORK_VERSION_SUFFIX = /-custom\.\d+$/;

type AppVersionParts = readonly [number, number, number];

function parseCanonicalAppVersion(value: unknown): AppVersionParts | null {
  if (typeof value !== "string") return null;

  const match = CANONICAL_APP_VERSION.exec(value);
  if (!match) return null;

  const parts: AppVersionParts = [Number(match[1]), Number(match[2]), Number(match[3])];
  return parts.every(Number.isSafeInteger) ? parts : null;
}

export function isCanonicalAppVersion(value: unknown): value is string {
  return parseCanonicalAppVersion(value) !== null;
}

function stripForkSuffix(value: string): string {
  return value.replace(FORK_VERSION_SUFFIX, "");
}

/** Returns negative when a < b, positive when a > b, and zero when equal. */
export function compareAppVersions(a: string, b: string): number {
  const left = parseCanonicalAppVersion(stripForkSuffix(a));
  const right = parseCanonicalAppVersion(stripForkSuffix(b));
  if (!left) return right ? -1 : 0;
  if (!right) return 1;
  for (let index = 0; index < 3; index += 1) {
    const difference = left[index] - right[index];
    if (difference !== 0) return difference;
  }
  return 0;
}

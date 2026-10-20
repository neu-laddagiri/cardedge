/**
 * Turns an untrusted `next` parameter into a path on this site. "//evil.com" and "/\evil.com"
 * both start with "/" but resolve to another host, so the check runs on the resolved URL.
 */
export function safeNextPath(requested: string | null, origin: string, fallback = "/account"): string {
  if (!requested?.startsWith("/")) return fallback;
  let target: URL;
  try {
    target = new URL(requested, origin);
  } catch {
    return fallback;
  }
  if (target.origin !== new URL(origin).origin) return fallback;
  return `${target.pathname}${target.search}${target.hash}`;
}

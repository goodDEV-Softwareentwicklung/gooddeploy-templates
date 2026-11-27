// Öffentliche Pfade der Seiten: eine Stelle für Frontend und Links.
export const homeSlug = "home";

export function pagePath(slug: string | null | undefined): string {
  return !slug || slug === homeSlug ? "/" : `/${slug}`;
}

/**
 * Nur Pfade auf der eigenen Website (gegen offene Weiterleitungen): beginnt
 * mit genau einem „/“, kein Backslash, keine Steuerzeichen, bleibt beim
 * Auflösen auf der eigenen Herkunft.
 */
export function isSafeInternalPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  if (/[\\\u0000-\u001f\u007f]/.test(path)) return false;
  const origin = "http://intern.invalid";
  try {
    return new URL(path, origin).origin === origin;
  } catch {
    return false;
  }
}

/** Normalisierter interner Pfad oder `null` (`/..//x.example` wird beim Normalisieren zu `//x.example`). */
export function safeInternalPath(path: string): string | null {
  if (!isSafeInternalPath(path)) return null;
  const url = new URL(path, "http://intern.invalid");
  const normalized = `${url.pathname}${url.search}${url.hash}`;
  return isSafeInternalPath(normalized) ? normalized : null;
}

/** Herkunft der Anfrage (Schema und Host), z. B. für kanonische Adressen und SEO-Vorschau */
export function requestOrigin(headers: { get(name: string): string | null } | undefined): string {
  const host = headers?.get("x-forwarded-host") ?? headers?.get("host") ?? "localhost:3000";
  const proto = headers?.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto.split(",")[0].trim()}://${host.split(",")[0].trim()}`;
}

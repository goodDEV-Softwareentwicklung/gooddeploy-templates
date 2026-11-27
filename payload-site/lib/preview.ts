// Live-Vorschau beim Bearbeiten einer Seite (payload.config.ts, admin.livePreview).
// Das Admin-Panel zeigt die Seite neben dem Formular in einem iframe mit
// ?preview=1. Nur wer angemeldet ist, bekommt dort den Entwurf zu sehen
// (app/(site)/…/page.tsx, lib/content.ts); ohne Anmeldung zeigt dieselbe Adresse
// den veröffentlichten Stand. Einen Link zum Teilen gibt es (noch) nicht.
import { pagePath, requestOrigin } from "./paths.ts";

/** Suchparameter, mit dem die Website Entwürfe zeigt (nur angemeldet) */
export const previewParam = "preview";

/** Größen der Vorschau im Admin-Panel; „An Fenster anpassen“ bringt Payload selbst mit */
export const previewBreakpoints = [
  { name: "desktop", label: "Desktop", width: 1440, height: 900 },
  { name: "tablet", label: "Tablet", width: 768, height: 1024 },
  { name: "mobile", label: "Mobil", width: 375, height: 667 },
];

/** Pfad der Vorschau einer Seite, z. B. /ueber-uns?preview=1 */
export function previewPath(slug: string | null | undefined): string {
  return `${pagePath(slug)}?${previewParam}=1`;
}

/**
 * Adresse für das iframe der Live-Vorschau; ohne Adresse der Seite (neue Seite,
 * noch kein Feld „Adresse“) keine Vorschau. Absolut, weil Payload daraus das
 * Ziel für die Nachrichten an die Vorschau ableitet.
 */
export function livePreviewUrl({ data, req }: { data?: { slug?: unknown } | null; req?: { headers?: Headers } }): string | null {
  const slug = typeof data?.slug === "string" ? data.slug.trim() : "";
  if (!slug) return null;
  return `${requestOrigin(req?.headers)}${previewPath(slug)}`;
}

/** true, wenn die Anfrage die Vorschau will (Wert aus searchParams der Seite) */
export function wantsPreview(searchParams: Record<string, string | string[] | undefined> | undefined): boolean {
  return searchParams?.[previewParam] === "1";
}

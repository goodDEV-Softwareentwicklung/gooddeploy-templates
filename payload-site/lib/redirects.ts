// Reine Logik für Weiterleitungen (Sammlung `redirects` aus
// @payloadcms/plugin-redirects): Pfade vereinheitlichen (beim Speichern und
// beim Nachschlagen gleich) und das Ziel eines Eintrags bestimmen. Angewendet
// in app/(site)/not-found-or-redirect.ts, wenn ein Pfad keine Seite hat.
import { pagePath, safeInternalPath } from "./paths.ts";

/** Arten, die die Redaktion wählen kann; Next.js antwortet mit 308 bzw. 307 */
export const redirectTypeOptions = [
  { value: "301", label: "Dauerhaft (301, z. B. Seite umbenannt)" },
  { value: "302", label: "Vorübergehend (302, z. B. Aktion läuft)" },
] as const;

/**
 * Einheitliche Form eines Quellpfads: mit führendem „/“, ohne Herkunft,
 * Abfrage, Sprungmarke und abschließenden „/“, Prozent-Kodierung aufgelöst.
 * `https://example.com/alt/?x=1` und `alt/` werden beide zu `/alt`.
 * `null` für Leeres und kaputte Kodierung.
 */
export function normalizeRedirectPath(input: string | null | undefined): string | null {
  let value = (input ?? "").trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) {
    try {
      value = new URL(value).pathname;
    } catch {
      return null;
    }
  }
  value = value.replace(/[?#].*$/, "");
  if (!value.startsWith("/")) value = `/${value}`;
  value = value.replace(/\/{2,}/g, "/");
  if (value.length > 1) value = value.replace(/\/+$/, "");
  try {
    value = decodeURI(value);
  } catch {
    return null;
  }
  return value;
}

/** Ziel einer freien Adresse: interner Pfad oder http(s)-Adresse, sonst `null` */
export function safeRedirectUrl(url: string | null | undefined): string | null {
  const value = (url ?? "").trim();
  if (!value) return null;
  if (value.startsWith("/")) return safeInternalPath(value);
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/** Prüfung des Felds `to.url` beim Speichern (Fehlertext am Feld) */
export function validateRedirectUrl(value: unknown): true | string {
  if (value === null || value === undefined || value === "") return true;
  return typeof value === "string" && safeRedirectUrl(value)
    ? true
    : "Bitte einen Pfad wie /kontakt oder eine Adresse mit https:// angeben.";
}

export type RedirectDoc = {
  from?: string | null;
  type?: string | null;
  to?: {
    type?: "reference" | "custom" | null;
    reference?: { relationTo: string; value: { slug?: string | null } | number | string | null } | null;
    url?: string | null;
  } | null;
};

export type RedirectTarget = { href: string; permanent: boolean };

/** Ziel eines Eintrags oder `null` (Seite nicht geladen, unsichere Adresse, Ziel gleich Quelle) */
export function redirectTarget(doc: RedirectDoc | null | undefined): RedirectTarget | null {
  if (!doc?.to) return null;
  let href: string | null = null;
  if (doc.to.type === "custom") {
    href = safeRedirectUrl(doc.to.url);
  } else {
    const value = doc.to.reference?.value;
    if (value && typeof value === "object" && value.slug) href = pagePath(value.slug);
  }
  if (!href) return null;
  if (href.startsWith("/") && normalizeRedirectPath(href) === normalizeRedirectPath(doc.from)) return null;
  // Ohne Angabe dauerhaft (Standard im Admin-Panel); 302 vorübergehend.
  return { href, permanent: !doc.type || doc.type === "301" || doc.type === "308" };
}

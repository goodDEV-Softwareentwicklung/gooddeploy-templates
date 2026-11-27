// Logo und Icon im Admin-Panel (ST-14-14, Kriterium 7): Kopf und Anmeldeseite
// zeigen statt des Payload-Logos das Logo der Website, ohne Logo das gewählte
// Icon in der Farbe des Themes (dasselbe Bild wie das Favicon, lib/favicon.ts),
// ohne Einstellungen ein neutrales Zeichen. Dargestellt in
// components/admin/AdminGraphics.tsx (payload.config.ts, admin.components.graphics).
import { faviconHref, faviconSource, type FaviconSettings } from "./favicon.ts";

export type AdminBrandSettings = FaviconSettings & { siteName?: string | null; shortName?: string | null };

export type AdminBrand = {
  /** Name für Alternativtext und neben dem Icon */
  name: string;
  /** Hochgeladenes Logo (eigene Adresse), sonst undefined */
  logoUrl?: string;
  /** Kleines Bild für Kopfzeile und Brotkrumen: /site-icon (Logo oder Icon) */
  iconUrl: string;
};

/** Neutraler Name, wenn die Website noch keinen hat */
export const fallbackName = "Website";

export function adminBrand(settings: AdminBrandSettings | null | undefined): AdminBrand {
  const source = faviconSource(settings);
  const name = settings?.shortName?.trim() || settings?.siteName?.trim() || fallbackName;
  return { name, logoUrl: source.kind === "logo" ? source.url : undefined, iconUrl: faviconHref(source) };
}

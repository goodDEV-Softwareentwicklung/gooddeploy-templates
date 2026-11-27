// Favicon der Website (E228): aus dem hochgeladenen Logo, sonst aus dem
// gewählten Icon in der Primärfarbe des Themes, sonst ein neutrales Zeichen.
// Kein Logo von Payload oder gooddeploy (E223). Ausgeliefert unter
// /site-icon (app/site-icon/route.ts), eingebunden im Layout der Website
// und im Admin-Panel (payload.config.ts). Folgt Änderungen an Logo, Icon und
// Theme: Die Adresse im Layout trägt eine Kennung des Stands (?v=…).
import { createHash } from "node:crypto";
import { resolveTheme, type ThemeSelection } from "../themes/resolve.ts";
import { iconNodes, neutralIconNode, type IconNode } from "../ui/icon-nodes.ts";
import type { IconName } from "../ui/icons.ts";

export const siteIconPath = "/site-icon";

/** Größen: Favicon im Browser und Symbol auf dem Home-Bildschirm (Apple) */
export const iconSizes = { icon: 64, apple: 180 } as const;
export type IconSize = keyof typeof iconSizes;

/** Was das Favicon braucht, aus dem Global „Website“ */
export type FaviconSettings = ThemeSelection & {
  logo?: number | { url?: string | null; mimeType?: string | null } | null;
  logoIcon?: string | null;
};

export type FaviconSource =
  | { kind: "logo"; url: string }
  | { kind: "icon"; node: IconNode; background: string; foreground: string; label: string };

function logoUrl(logo: FaviconSettings["logo"]): string | undefined {
  if (!logo || typeof logo === "number" || !logo.url) return undefined;
  // nur eigene Adressen (Payload: /api/media/file/…, Beispielbilder: /samples/…)
  return logo.url.startsWith("/") && !logo.url.startsWith("//") ? logo.url : undefined;
}

export function faviconSource(settings: FaviconSettings | null | undefined): FaviconSource {
  const url = logoUrl(settings?.logo);
  if (url) return { kind: "logo", url };
  const { colors } = resolveTheme(settings);
  const name = settings?.logoIcon;
  const node = name && Object.hasOwn(iconNodes, name) ? iconNodes[name as IconName] : neutralIconNode;
  return { kind: "icon", node, background: colors.primary, foreground: colors.primaryInk, label: name ?? "neutral" };
}

const escapeAttribute = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Icon auf einer Fläche in der Primärfarbe als SVG. Favicon mit runden Ecken;
 * Apple rundet selbst und will eine volle Fläche mit Rand.
 */
export function iconSvg(source: Extract<FaviconSource, { kind: "icon" }>, size: IconSize): string {
  const px = iconSizes[size];
  const radius = size === "apple" ? 0 : 14;
  const inset = size === "apple" ? 14 : 10; // Rand um das 24er-Zeichen in einem 64er-Raster
  const scale = (64 - 2 * inset) / 24;
  const elements = source.node
    .map(([tag, attrs]) => {
      const attributes = Object.entries(attrs)
        .filter(([key]) => key !== "key")
        .map(([key, value]) => `${key}="${escapeAttribute(String(value))}"`)
        .join(" ");
      return `<${tag} ${attributes}/>`;
    })
    .join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="${radius}" fill="${escapeAttribute(source.background)}"/>` +
    `<g transform="translate(${inset} ${inset}) scale(${scale})" fill="none" stroke="${escapeAttribute(source.foreground)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
    elements +
    `</g></svg>`
  );
}

/** Kennung des Stands für die Adresse im Layout: ändert sich mit Logo, Icon und Farben */
export function faviconVersion(source: FaviconSource): string {
  const key = source.kind === "logo" ? source.url : `${source.label}|${source.background}|${source.foreground}`;
  return createHash("sha256").update(key).digest("hex").slice(0, 10);
}

/** Adresse des Favicons mit Kennung des Stands */
export function faviconHref(source: FaviconSource, size: IconSize = "icon"): string {
  const params = new URLSearchParams({ v: faviconVersion(source) });
  if (size !== "icon") params.set("size", size);
  return `${siteIconPath}?${params}`;
}

/**
 * Abbildung Payload-Daten → neutrale ui-Props. Nur hier und in den
 * Modul-Komponenten kennt das Frontend die Form der Payload-Daten.
 */
import { safeLinkUrl } from "../lib/links.ts";
import { pagePath } from "../lib/paths.ts";
import type { Media, Page } from "../payload-types.ts";
import type { UiNavItem } from "../ui/navigation.ts";
import type { UiHeading, UiImage, UiLink, UiLinkAppearance } from "../ui/types.ts";

/** Gemeinsame Form der Link-Gruppe aus fields/link.ts */
export type LinkData = {
  /** `none`: kein Ziel (nur Menüpunkte, die Unterpunkte gruppieren) */
  type?: "reference" | "custom" | "none" | null;
  newTab?: boolean | null;
  label?: string | null;
  reference?: number | Page | null;
  url?: string | null;
  anchor?: string | null;
  appearance?: UiLinkAppearance | null;
};

export function toImage(media: number | Media | null | undefined): UiImage | undefined {
  if (!media || typeof media === "number" || !media.url) return undefined;
  return {
    src: media.url,
    alt: media.alt ?? "",
    width: media.width ?? undefined,
    height: media.height ?? undefined,
    focalX: media.focalX ?? undefined,
    focalY: media.focalY ?? undefined,
  };
}

export function linkHref(link: LinkData | null | undefined): string | undefined {
  if (!link || link.type === "none") return undefined;
  if (link.type === "custom") return safeLinkUrl(link.url) ?? undefined;
  const ref = link.reference;
  if (!ref || typeof ref === "number") return undefined;
  const path = pagePath(ref.slug);
  return link.anchor ? `${path}#${link.anchor}` : path;
}

export function toLink(link: LinkData | null | undefined): UiLink | undefined {
  const href = linkHref(link);
  if (!link || !href) return undefined;
  const fallback = link.reference && typeof link.reference !== "number" ? link.reference.title : href;
  return {
    href,
    label: link.label || fallback,
    newTab: link.newTab ?? undefined,
    appearance: link.appearance ?? undefined,
  };
}

export function toLinks(rows: { link: LinkData }[] | null | undefined): UiLink[] {
  return (rows ?? []).map((row) => toLink(row.link)).filter((l): l is UiLink => Boolean(l));
}

/** Zeile der Hauptnavigation aus dem Global „Website“ */
export type NavigationRowData = {
  link: LinkData;
  children?: { link: LinkData }[] | null;
};

/**
 * Hauptnavigation → ui. Unterpunkte ohne Ziel entfallen. Ein Punkt ohne
 * eigenes Ziel bleibt als Gruppe, solange er Unterpunkte hat, sonst entfällt er.
 */
export function toNavigation(rows: NavigationRowData[] | null | undefined): UiNavItem[] {
  return (rows ?? []).flatMap((row): UiNavItem[] => {
    const children = toLinks(row.children);
    const link = toLink(row.link);
    if (link) return [{ href: link.href, label: link.label, newTab: link.newTab, children }];
    const label = row.link?.label?.trim();
    if (!label || children.length === 0) return [];
    return [{ label, children }];
  });
}

export function toHeading(block: { eyebrow?: string | null; title?: string | null; intro?: string | null }): UiHeading {
  return {
    eyebrow: block.eyebrow ?? undefined,
    title: block.title ?? undefined,
    intro: block.intro ?? undefined,
  };
}

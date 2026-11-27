// SEO-Felder (`meta` aus @payloadcms/plugin-seo) → Next.js-Metadaten: Titel,
// Beschreibung, Vorschaubild, kanonische Adresse, Open Graph. Leere Felder
// fallen auf den Seitentitel und die Beschreibung aus „Website“ zurück.
import type { Metadata } from "next";
import type { Media } from "../payload-types.ts";

export type SeoMeta = { title?: string | null; description?: string | null; image?: number | Media | null };

const text = (value: string | null | undefined) => value?.trim() || undefined;

/** Absolute Adresse (Bilder liegen unter /api/media/…) */
export function absoluteUrl(url: string, origin: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${origin.replace(/\/+$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function contentMetadata(input: {
  meta?: SeoMeta | null;
  /** Titel der Seite, wenn `meta.title` leer ist */
  title: string;
  /** Beschreibung, wenn `meta.description` leer ist (z. B. aus „Website“) */
  fallbackDescription?: string | null;
  /** Pfad der Seite, z. B. `/kontakt` */
  path: string;
  /** Herkunft ohne „/“ am Ende, z. B. `https://example.com` */
  origin: string;
}): Metadata {
  const title = text(input.meta?.title) ?? input.title;
  const description = text(input.meta?.description) ?? text(input.fallbackDescription);
  const media = input.meta?.image;
  const image = media && typeof media === "object" && media.url ? media : undefined;
  const url = absoluteUrl(input.path, input.origin);
  const images = image
    ? [
        {
          url: absoluteUrl(image.url!, input.origin),
          ...(image.width ? { width: image.width } : {}),
          ...(image.height ? { height: image.height } : {}),
          alt: image.alt,
        },
      ]
    : undefined;
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: url },
    openGraph: { title, ...(description ? { description } : {}), url, type: "website", locale: "de_DE", ...(images ? { images } : {}) },
    twitter: { card: images ? "summary_large_image" : "summary", title, ...(description ? { description } : {}) },
  };
}

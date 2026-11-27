import type { Block } from "payload";

/** Gruppen in der Auswahl der Module im Admin-Panel */
export const blockGroups = {
  structure: "Kopf & Layout",
  text: "Text & Struktur",
  lists: "Kacheln & Listen",
  media: "Bilder",
} as const;

/** Gruppe und Vorschaubild (public/blocks/<slug>.svg) für die Auswahl der Module */
export function blockAdmin(slug: string, group: string, alt: string): Block["admin"] {
  return {
    group,
    images: { thumbnail: { url: `/blocks/${slug}.svg`, alt } },
  };
}

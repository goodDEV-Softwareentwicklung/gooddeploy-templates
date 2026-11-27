// Seiten der Website, aufgebaut aus Modulen (blocks/). Die Seite mit der
// Adresse „home“ ist die Startseite (/), alle anderen erscheinen unter /<adresse>.
import type { Access, CollectionConfig } from "payload";
import { pageLayoutBlocks } from "../blocks/index.ts";
import { seoFields } from "../fields/seo.ts";
import { homeSlug } from "../lib/paths.ts";

export { homeSlug };

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validSlug(value: unknown): true | string {
  return typeof value === "string" && slugPattern.test(value) ? true : "Nur Kleinbuchstaben, Ziffern und Bindestriche, z. B. ueber-uns.";
}

const loggedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

/** Ohne Anmeldung nur veröffentlichte Seiten (Website und API); angemeldet auch Entwürfe. */
export const readPublishedOrLoggedIn: Access = ({ req }) => (req.user ? true : { _status: { equals: "published" } });

/** Abstand des automatischen Speicherns beim Tippen (Entwurf, Live-Vorschau) in Millisekunden */
export const autosaveInterval = 800;

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Seite", plural: "Seiten" },
  admin: {
    useAsTitle: "title",
    group: "Inhalte",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    description: `Die Startseite hat die Adresse „${homeSlug}“. Menü und Fuß stehen unter „Website“.`,
  },
  access: { read: readPublishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  // Entwürfe: Änderungen speichert Payload beim Tippen als Entwurf (die
  // Live-Vorschau zeigt sie sofort), live gehen sie erst mit „Veröffentlichen“.
  // „Entwurf speichern“ bleibt als Knopf sichtbar. Ältere Stände unter „Versionen“.
  versions: {
    drafts: { autosave: { interval: autosaveInterval, showSaveDraftButton: true } },
    maxPerDoc: 50,
  },
  defaultSort: "title",
  fields: [
    { name: "title", label: "Titel", type: "text", required: true },
    {
      name: "slug",
      label: "Adresse",
      type: "text",
      required: true,
      unique: true,
      index: true,
      validate: validSlug,
      admin: {
        position: "sidebar",
        description: `Teil der Adresse, z. B. ueber-uns für /ueber-uns. „${homeSlug}“ ist die Startseite.`,
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Inhalt",
          fields: [
            { name: "layout", label: "Module", type: "blocks", blocks: pageLayoutBlocks, labels: { singular: "Modul", plural: "Module" } },
          ],
        },
        { label: "SEO", fields: seoFields() },
      ],
    },
  ],
};

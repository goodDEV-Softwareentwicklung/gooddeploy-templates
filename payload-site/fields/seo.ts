// SEO über das offizielle Plugin @payloadcms/plugin-seo: Gruppe `meta`
// (Titel, Beschreibung, Vorschaubild) im Reiter „SEO“ der Seiten, mit den
// Knöpfen „Erzeugen“ und der Vorschau des Plugins. lib/metadata.ts macht
// daraus die Meta-Tags der Seite.
import { MetaDescriptionField, MetaImageField, MetaTitleField, OverviewField, PreviewField } from "@payloadcms/plugin-seo/fields";
import type { SEOPluginConfig } from "@payloadcms/plugin-seo/types";
import type { Field } from "payload";
import { pagePath, requestOrigin } from "../lib/paths.ts";

const uploadsCollection = "media";

type SeoDoc = { title?: string | null; slug?: string | null };

export const seoPluginOptions: SEOPluginConfig = {
  uploadsCollection,
  generateTitle: ({ doc }) => (doc as SeoDoc | undefined)?.title ?? "",
  generateURL: ({ doc, req }) => `${requestOrigin(req?.headers)}${pagePath((doc as SeoDoc | undefined)?.slug)}`,
};

/** Felder des SEO-Plugins in der Gruppe `meta` (für den Reiter „SEO“) */
export function seoFields(): Field[] {
  return [
    {
      name: "meta",
      label: "Suchmaschinen und Teilen",
      type: "group",
      fields: [
        OverviewField({ overrides: { label: "Übersicht" } }),
        MetaTitleField({ hasGenerateFn: true, overrides: { label: "Titel (leer = Seitentitel)" } }),
        MetaDescriptionField({ overrides: { label: "Beschreibung (leer = Beschreibung aus „Website“)", maxLength: 300 } }),
        // admin nicht überschreiben: dort steckt die Komponente des Plugins
        MetaImageField({ relationTo: uploadsCollection, overrides: { label: "Vorschaubild beim Teilen" } }),
        PreviewField({ hasGenerateFn: true, overrides: { label: "Vorschau in Suchergebnissen" } }),
      ],
    },
  ];
}

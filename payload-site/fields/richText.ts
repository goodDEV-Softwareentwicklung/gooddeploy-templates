import type { Block, RichTextField } from "payload";
import { BlocksFeature, FixedToolbarFeature, HeadingFeature, LinkFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import { validateLinkUrl } from "../lib/links.ts";
import { linkField } from "./link.ts";

/**
 * Kleine Bausteine im Fließtext (Lexical-Blöcke). Bewusst nur Elemente, die
 * in einen Textfluss gehören; Layout-Module bleiben Blöcke im Seitenlayout.
 */
export const RichTextButton: Block = {
  slug: "button",
  interfaceName: "RichTextButtonBlock",
  labels: { singular: "Knopf", plural: "Knöpfe" },
  fields: [linkField({ name: "link", label: "Knopf", required: true })],
};

export const RichTextInfoBox: Block = {
  slug: "infoBox",
  interfaceName: "RichTextInfoBoxBlock",
  labels: { singular: "Hinweiskasten", plural: "Hinweiskästen" },
  fields: [
    {
      name: "tone",
      label: "Farbe",
      type: "select",
      defaultValue: "surface",
      options: [
        { value: "surface", label: "Hell" },
        { value: "primary", label: "Primärfarbe" },
        { value: "accent", label: "Akzentfarbe" },
      ],
    },
    { name: "title", label: "Überschrift", type: "text" },
    { name: "text", label: "Text", type: "textarea", required: true },
  ],
};

/**
 * Felder des Link-Features mit zusätzlicher Prüfung der freien Adresse
 * (`url`, nur bei linkType custom); die Prüfung von Payload bleibt davor.
 */
export function withSafeLinkUrl<T extends { type: string; validate?: unknown }>(defaultFields: T[]): T[] {
  return defaultFields.map((field) => {
    if (!("name" in field) || (field as { name?: unknown }).name !== "url" || field.type !== "text") return field;
    const base = field.validate as ((value: unknown, options: unknown) => true | string | undefined) | undefined;
    const validate = (value: unknown, options: { siblingData?: { linkType?: string } }) => {
      const result = base ? base(value, options) : true;
      if (options?.siblingData?.linkType !== "custom" || (result !== true && result !== undefined)) return result;
      return validateLinkUrl(value);
    };
    return { ...field, validate } as T;
  });
}

export const richTextEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((f) => f.key !== "heading" && f.key !== "link" && f.key !== "upload" && f.key !== "relationship"),
    HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
    LinkFeature({
      enabledCollections: ["pages"],
      // Freie Adressen wie bei Links in Modulen prüfen (lib/links.ts): kein javascript:, data:, //host.
      fields: ({ defaultFields }) => withSafeLinkUrl(defaultFields),
    }),
    FixedToolbarFeature(),
    BlocksFeature({ blocks: [RichTextButton, RichTextInfoBox] }),
  ],
});

export function richTextField(name = "content", label = "Text", required = false): RichTextField {
  return { name, label, type: "richText", required, editor: richTextEditor };
}

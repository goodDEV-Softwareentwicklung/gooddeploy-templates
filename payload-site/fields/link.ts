import type { ArrayField, Field, GroupField } from "payload";
import { validateLinkUrl } from "../lib/links.ts";

type LinkOptions = {
  name?: string;
  label?: string;
  /** Darstellung als Knopf wählbar */
  appearance?: boolean;
  required?: boolean;
  /** Zusätzliche Wahl „Kein Ziel“ (z. B. Menüpunkt, der nur Unterpunkte gruppiert) */
  allowNoTarget?: boolean;
};

/** Ziel-Typen der Link-Gruppe; `none` nur mit `allowNoTarget` */
export type LinkTargetType = "reference" | "custom" | "none";

const hasReference = (sibling: { type?: LinkTargetType | null } | undefined) => sibling?.type !== "custom" && sibling?.type !== "none";

export const linkAppearanceOptions = [
  { value: "accent", label: "Akzent (Hauptaktion)" },
  { value: "primary", label: "Primärfarbe" },
  { value: "outline", label: "Umrandet" },
];

/** Link auf eine Seite oder eine freie Adresse. */
export function linkField({
  name = "link",
  label = "Link",
  appearance = true,
  required = false,
  allowNoTarget = false,
}: LinkOptions = {}): GroupField {
  const fields: Field[] = [
    {
      type: "row",
      fields: [
        {
          name: "type",
          label: "Ziel",
          type: "radio",
          defaultValue: "reference",
          options: [
            { value: "reference", label: "Interne Seite" },
            { value: "custom", label: "Adresse" },
            ...(allowNoTarget ? [{ value: "none", label: "Kein Ziel" }] : []),
          ],
          admin: { layout: "horizontal", width: "50%" },
        },
        {
          name: "newTab",
          label: "In neuem Tab öffnen",
          type: "checkbox",
          admin: { width: "50%", style: { alignSelf: "flex-end" } },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "label",
          label: "Beschriftung",
          type: "text",
          required,
          admin: { width: "50%" },
        },
        {
          name: "reference",
          label: "Seite",
          type: "relationship",
          relationTo: "pages",
          required,
          maxDepth: 1,
          admin: { width: "50%", condition: (_, sibling) => hasReference(sibling) },
        },
        {
          name: "url",
          label: "Adresse",
          type: "text",
          required,
          // Payload ruft die eigene Prüfung statt der Standardprüfung: Pflichtfeld hier mitprüfen.
          validate: (value: unknown, { siblingData }: { siblingData?: { type?: string | null } }) => {
            if (siblingData?.type !== "custom") return true;
            if (required && !value) return "Bitte eine Adresse angeben.";
            return validateLinkUrl(value);
          },
          admin: {
            width: "50%",
            condition: (_, sibling) => sibling?.type === "custom",
            description: "z. B. https://…, mailto:…, tel:… oder /kontakt#formular",
          },
        },
      ],
    },
    {
      name: "anchor",
      label: "Sprungmarke (optional)",
      type: "text",
      admin: {
        condition: (_, sibling) => hasReference(sibling),
        description: "ohne #, z. B. kontakt",
      },
    },
  ];

  if (appearance) {
    fields.push({
      name: "appearance",
      label: "Darstellung",
      type: "select",
      defaultValue: "accent",
      options: linkAppearanceOptions,
    });
  }

  return {
    name,
    label,
    type: "group",
    admin: { hideGutter: true },
    fields,
  };
}

/** Mehrere Knöpfe, z. B. im Hero */
export function linksField({
  name = "links",
  label = "Knöpfe",
  maxRows = 2,
}: { name?: string; label?: string; maxRows?: number } = {}): ArrayField {
  return {
    name,
    label,
    type: "array",
    maxRows,
    labels: { singular: "Knopf", plural: "Knöpfe" },
    fields: [linkField({ required: true })],
  };
}

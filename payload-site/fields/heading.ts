import type { Field } from "payload";

/** Dachzeile, Überschrift und Einleitung eines Abschnitts oder Moduls. */
export function headingFields({ titleRequired = false }: { titleRequired?: boolean } = {}): Field[] {
  return [
    {
      type: "row",
      fields: [
        { name: "eyebrow", label: "Dachzeile", type: "text", admin: { width: "35%" } },
        {
          name: "title",
          label: "Überschrift",
          type: "text",
          required: titleRequired,
          admin: { width: "65%" },
        },
      ],
    },
    { name: "intro", label: "Einleitung", type: "textarea" },
  ];
}

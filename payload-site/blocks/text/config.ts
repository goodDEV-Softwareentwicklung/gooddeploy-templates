import type { Block } from "payload";
import { headingFields } from "../../fields/heading.ts";
import { richTextField } from "../../fields/richText.ts";
import { blockAdmin, blockGroups } from "../shared.ts";

export const Text: Block = {
  slug: "text",
  interfaceName: "TextBlock",
  labels: { singular: "Text", plural: "Texte" },
  admin: blockAdmin("text", blockGroups.text, "Überschrift und Fließtext"),
  fields: [
    ...headingFields(),
    richTextField("content", "Text", true),
    {
      name: "width",
      label: "Breite",
      type: "select",
      defaultValue: "prose",
      options: [
        { value: "prose", label: "Lesebreite" },
        { value: "full", label: "Ganze Breite" },
      ],
    },
  ],
};

import type { Block } from "payload";
import { headingFields } from "../../fields/heading.ts";
import { richTextField } from "../../fields/richText.ts";
import { blockAdmin, blockGroups } from "../shared.ts";

export const Accordion: Block = {
  slug: "accordion",
  interfaceName: "AccordionBlock",
  labels: { singular: "Akkordeon / FAQ", plural: "Akkordeons" },
  admin: blockAdmin("accordion", blockGroups.text, "Aufklappbare Fragen und Antworten"),
  fields: [
    ...headingFields(),
    {
      name: "items",
      label: "Einträge",
      type: "array",
      minRows: 1,
      maxRows: 30,
      labels: { singular: "Eintrag", plural: "Einträge" },
      admin: { initCollapsed: true },
      fields: [
        { name: "title", label: "Frage / Titel", type: "text", required: true },
        richTextField("content", "Antwort / Inhalt", true),
        { name: "open", label: "Anfangs geöffnet", type: "checkbox" },
      ],
    },
  ],
};

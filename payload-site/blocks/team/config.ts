import type { Block } from "payload";
import { headingFields } from "../../fields/heading.ts";
import { blockAdmin, blockGroups } from "../shared.ts";

export const Team: Block = {
  slug: "team",
  interfaceName: "TeamBlock",
  labels: { singular: "Team", plural: "Teams" },
  admin: blockAdmin("team", blockGroups.lists, "Personen mit Foto oder Initialen"),
  fields: [
    ...headingFields(),
    {
      name: "people",
      label: "Personen",
      type: "relationship",
      relationTo: "people",
      hasMany: true,
      required: true,
      admin: {
        description: "Reihenfolge per Drag-and-drop. Personen pflegt ihr unter „Personen“.",
      },
    },
    { name: "showContact", label: "E-Mail und Telefon zeigen", type: "checkbox" },
  ],
};

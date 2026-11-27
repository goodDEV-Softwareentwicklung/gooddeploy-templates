import type { Block } from "payload";
import { headingFields } from "../../fields/heading.ts";
import { blockAdmin, blockGroups } from "../shared.ts";

export const Stats: Block = {
  slug: "stats",
  interfaceName: "StatsBlock",
  labels: { singular: "Kennzahlen", plural: "Kennzahlen" },
  admin: blockAdmin("stats", blockGroups.lists, "Zahlen mit Beschriftung, als Band, Kacheln, Zeitleiste oder Tabelle"),
  fields: [
    ...headingFields(),
    {
      name: "variant",
      label: "Darstellung",
      type: "select",
      defaultValue: "band",
      required: true,
      options: [
        { value: "band", label: "Band (dunkel, ganze Breite)" },
        { value: "tiles", label: "Kacheln" },
        { value: "timeline", label: "Zeitleiste (Jahr und Text)" },
        { value: "table", label: "Tabelle (z. B. Preise)" },
      ],
    },
    {
      name: "items",
      label: "Einträge",
      type: "array",
      minRows: 1,
      maxRows: 12,
      labels: { singular: "Eintrag", plural: "Einträge" },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "value",
              label: "Zahl / Wert",
              type: "text",
              required: true,
              admin: { width: "35%" },
            },
            {
              name: "label",
              label: "Beschriftung",
              type: "text",
              required: true,
              admin: { width: "65%" },
            },
          ],
        },
      ],
    },
  ],
};

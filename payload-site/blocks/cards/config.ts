import type { Block } from "payload";
import { iconOptions } from "../../ui/icons.ts";
import { headingFields } from "../../fields/heading.ts";
import { linkField } from "../../fields/link.ts";
import { blockAdmin, blockGroups } from "../shared.ts";

export const Cards: Block = {
  slug: "cards",
  interfaceName: "CardsBlock",
  labels: { singular: "Kacheln", plural: "Kacheln" },
  admin: blockAdmin("cards", blockGroups.lists, "Raster aus Karten mit Bild oder Icon"),
  fields: [
    ...headingFields(),
    {
      type: "row",
      fields: [
        {
          name: "style",
          label: "Darstellung",
          type: "select",
          defaultValue: "image",
          options: [
            { value: "image", label: "Karten mit Bild" },
            { value: "icon", label: "Icon-Kacheln" },
            { value: "logo", label: "Logos (Partner, Sponsoren)" },
          ],
          admin: { width: "50%" },
        },
        {
          name: "columns",
          label: "Spalten",
          type: "select",
          defaultValue: "3",
          options: [
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
          ],
          admin: { width: "50%" },
        },
      ],
    },
    {
      name: "items",
      label: "Karten",
      type: "array",
      minRows: 1,
      maxRows: 12,
      labels: { singular: "Karte", plural: "Karten" },
      admin: { initCollapsed: true },
      fields: [
        {
          name: "title",
          label: "Titel",
          type: "text",
          required: true,
          admin: { description: "Bei Logos: Name des Partners, steht klein unter dem Logo" },
        },
        { name: "text", label: "Text", type: "textarea" },
        {
          type: "row",
          fields: [
            {
              name: "image",
              label: "Bild",
              type: "upload",
              relationTo: "media",
              admin: { width: "50%" },
            },
            {
              name: "icon",
              label: "Icon",
              type: "select",
              options: [...iconOptions],
              admin: { width: "50%" },
            },
          ],
        },
        {
          name: "tag",
          label: "Etikett auf dem Bild",
          type: "text",
          admin: { description: "z. B. „Beliebt“" },
        },
        {
          name: "details",
          label: "Stichpunkte",
          type: "array",
          maxRows: 6,
          labels: { singular: "Stichpunkt", plural: "Stichpunkte" },
          fields: [{ name: "text", label: "Text", type: "text", required: true }],
        },
        { ...linkField({ name: "link", label: "Link (optional)", appearance: false }) },
      ],
    },
    linkField({ name: "moreLink", label: "Mehr-Link unter den Karten", appearance: false }),
  ],
};

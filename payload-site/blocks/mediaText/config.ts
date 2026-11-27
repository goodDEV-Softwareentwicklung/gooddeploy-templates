import type { Block } from "payload";
import { linksField } from "../../fields/link.ts";
import { richTextField } from "../../fields/richText.ts";
import { blockAdmin, blockGroups } from "../shared.ts";

export const MediaText: Block = {
  slug: "mediaText",
  interfaceName: "MediaTextBlock",
  labels: { singular: "Bild + Text", plural: "Bild + Text" },
  admin: blockAdmin("mediaText", blockGroups.text, "Bild neben Text"),
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "image",
          label: "Bild",
          type: "upload",
          relationTo: "media",
          required: true,
          admin: { width: "50%" },
        },
        {
          name: "imagePosition",
          label: "Bild",
          type: "radio",
          defaultValue: "left",
          options: [
            { value: "left", label: "links" },
            { value: "right", label: "rechts" },
          ],
          admin: { width: "50%", layout: "horizontal" },
        },
      ],
    },
    { name: "eyebrow", label: "Dachzeile", type: "text" },
    { name: "title", label: "Überschrift", type: "text" },
    richTextField("content", "Text"),
    linksField({ maxRows: 2 }),
  ],
};

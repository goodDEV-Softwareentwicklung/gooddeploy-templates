import type { Block } from "payload";
import { blockAdmin, blockGroups } from "../shared.ts";

export const Quote: Block = {
  slug: "quote",
  interfaceName: "QuoteBlock",
  labels: { singular: "Zitat", plural: "Zitate" },
  admin: blockAdmin("quote", blockGroups.text, "Zitat mit Person"),
  fields: [
    { name: "text", label: "Zitat", type: "textarea", required: true },
    {
      type: "row",
      fields: [
        { name: "person", label: "Person", type: "text", admin: { width: "50%" } },
        { name: "role", label: "Funktion", type: "text", admin: { width: "50%" } },
      ],
    },
    {
      name: "image",
      label: "Foto (optional, sonst Initialen)",
      type: "upload",
      relationTo: "media",
    },
  ],
};

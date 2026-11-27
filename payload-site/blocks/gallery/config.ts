import type { Block } from "payload";
import { headingFields } from "../../fields/heading.ts";
import { blockAdmin, blockGroups } from "../shared.ts";

export const Gallery: Block = {
  slug: "gallery",
  interfaceName: "GalleryBlock",
  labels: { singular: "Galerie", plural: "Galerien" },
  admin: blockAdmin("gallery", blockGroups.media, "Bilderraster"),
  fields: [
    ...headingFields(),
    {
      name: "images",
      label: "Bilder",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      minRows: 1,
      maxRows: 24,
      required: true,
    },
  ],
};

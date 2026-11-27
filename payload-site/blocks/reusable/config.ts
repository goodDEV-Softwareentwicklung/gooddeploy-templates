import type { Block } from "payload";
import { blockAdmin, blockGroups } from "../shared.ts";

/** Verweis auf ein Modul aus der Bibliothek (Sammlung reusable-blocks). */
export const Reusable: Block = {
  slug: "reusable",
  interfaceName: "ReusableBlockReference",
  labels: { singular: "Wiederverwendbares Modul", plural: "Wiederverwendbare Module" },
  admin: blockAdmin("reusable", blockGroups.structure, "Modul aus der Bibliothek einfügen"),
  fields: [
    {
      name: "reference",
      label: "Modul aus der Bibliothek",
      type: "relationship",
      relationTo: "reusable-blocks",
      required: true,
      admin: { description: "Änderungen am Modul in der Bibliothek wirken auf allen Seiten, die sie nutzen." },
    },
  ],
};

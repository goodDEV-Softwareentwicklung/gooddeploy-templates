// Bibliothek wiederverwendbarer Module: Änderungen wirken sofort auf allen
// Seiten, die das Modul nutzen (Modul „Wiederverwendbares Modul“).
import type { CollectionConfig } from "payload";
import { reusableLayoutBlocks } from "../blocks/index.ts";

const loggedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

export const ReusableBlocks: CollectionConfig = {
  slug: "reusable-blocks",
  labels: { singular: "Wiederverwendbares Modul", plural: "Modul-Bibliothek" },
  admin: {
    useAsTitle: "title",
    group: "Inhalte",
    description: "Module, die auf mehreren Seiten gleich erscheinen, z. B. ein Aufruf zur Kontaktaufnahme.",
  },
  access: { read: () => true, create: loggedIn, update: loggedIn, delete: loggedIn },
  fields: [
    { name: "title", label: "Name in der Bibliothek", type: "text", required: true },
    { name: "layout", label: "Module", type: "blocks", blocks: reusableLayoutBlocks, minRows: 1 },
  ],
};

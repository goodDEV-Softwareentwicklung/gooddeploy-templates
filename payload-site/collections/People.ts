// Personen für die Module Team und Kontakt: nur Stammdaten, keine eigene Seite.
import type { CollectionConfig } from "payload";

const loggedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

export const People: CollectionConfig = {
  slug: "people",
  labels: { singular: "Person", plural: "Personen" },
  admin: { useAsTitle: "name", group: "Inhalte", defaultColumns: ["name", "role", "email"] },
  access: { read: () => true, create: loggedIn, update: loggedIn, delete: loggedIn },
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "role", label: "Funktion", type: "text" },
    { name: "image", label: "Foto", type: "upload", relationTo: "media" },
    {
      type: "row",
      fields: [
        { name: "email", label: "E-Mail", type: "email", admin: { width: "50%" } },
        { name: "phone", label: "Telefon", type: "text", admin: { width: "50%" } },
      ],
    },
  ],
};

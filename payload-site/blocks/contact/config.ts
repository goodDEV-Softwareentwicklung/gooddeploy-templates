import type { Block } from "payload";
import { headingFields } from "../../fields/heading.ts";
import { blockAdmin, blockGroups } from "../shared.ts";

export const Contact: Block = {
  slug: "contact",
  interfaceName: "ContactBlock",
  labels: { singular: "Kontakt", plural: "Kontakte" },
  admin: blockAdmin("contact", blockGroups.text, "Ansprechperson, Adresse, E-Mail, Telefon und Zeiten"),
  fields: [
    ...headingFields(),
    { name: "contactPerson", label: "Ansprechperson", type: "relationship", relationTo: "people" },
    { name: "address", label: "Adresse", type: "textarea" },
    {
      type: "row",
      fields: [
        { name: "email", label: "E-Mail", type: "email", admin: { width: "50%" } },
        { name: "phone", label: "Telefon", type: "text", admin: { width: "50%" } },
      ],
    },
    { name: "hoursTitle", label: "Überschrift Zeiten", type: "text", defaultValue: "Öffnungszeiten" },
    {
      name: "hours",
      label: "Zeiten",
      type: "textarea",
      admin: { description: "Eine Zeile je Eintrag" },
    },
  ],
};

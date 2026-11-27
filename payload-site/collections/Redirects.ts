// Optionen für @payloadcms/plugin-redirects: Sammlung `redirects` mit
// deutschen Labels (das Plugin bringt keine deutsche Übersetzung mit),
// Quellpfad beim Speichern vereinheitlicht, freie Ziele nur als Pfad oder
// http(s)-Adresse, keine Ketten. Angewendet im Frontend, wenn ein Pfad keine
// Seite hat (app/(site)/not-found-or-redirect.ts).
import type { RedirectsPluginConfig } from "@payloadcms/plugin-redirects/types";
import { ValidationError, type CollectionBeforeValidateHook, type Field, type FieldHook, type GroupField } from "payload";
import { normalizeRedirectPath, redirectTypeOptions, validateRedirectUrl } from "../lib/redirects.ts";

const loggedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

const normalizeFrom: FieldHook = ({ value }) => (typeof value === "string" ? (normalizeRedirectPath(value) ?? value) : value);

/**
 * Keine Ketten oder Schleifen: Ist das freie Ziel (Pfad) selbst Quelle einer
 * anderen Weiterleitung, lehnt das Speichern ab (/a → /b und /b → /a liefe im
 * Browser endlos). Ziele auf Seiten sind unkritisch, sie existieren.
 */
export const preventChains: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  const to = data?.to as { type?: string; url?: string } | undefined;
  if (to?.type !== "custom" || typeof to.url !== "string" || !to.url.startsWith("/")) return data;
  const target = normalizeRedirectPath(to.url);
  if (!target) return data;
  const id = originalDoc?.id;
  const { totalDocs } = await req.payload.count({
    collection: "redirects",
    where: id ? { and: [{ from: { equals: target } }, { id: { not_equals: id } }] } : { from: { equals: target } },
    req,
  });
  if (totalDocs > 0) {
    throw new ValidationError({
      collection: "redirects",
      errors: [{ path: "to.url", message: `„${target}“ ist selbst eine Weiterleitung. Bitte das endgültige Ziel eintragen.` }],
    });
  }
  return data;
};

const toLabels: Record<string, string> = { type: "Ziel", reference: "Seite", url: "Adresse" };

function germanTo(field: GroupField): GroupField {
  return {
    ...field,
    label: "Ziel",
    fields: field.fields.map((sub): Field => {
      if (!("name" in sub)) return sub;
      const label = toLabels[sub.name] ?? sub.label;
      if (sub.name === "type" && sub.type === "radio") {
        return {
          ...sub,
          label,
          options: [
            { value: "reference", label: "Interne Seite" },
            { value: "custom", label: "Freie Adresse" },
          ],
        };
      }
      if (sub.name === "url" && sub.type === "text") {
        return {
          ...sub,
          label,
          validate: (value: unknown) => validateRedirectUrl(value),
          admin: { ...sub.admin, description: "z. B. /kontakt oder https://…" },
        };
      }
      return { ...sub, label } as Field;
    }),
  };
}

function germanFields({ defaultFields }: { defaultFields: Field[] }): Field[] {
  return defaultFields.map((field): Field => {
    if (!("name" in field)) return field;
    if (field.name === "from" && field.type === "text") {
      return {
        ...field,
        label: "Alter Pfad",
        admin: { ...field.admin, description: "z. B. /alte-seite (ohne Domain)" },
        hooks: { ...field.hooks, beforeValidate: [normalizeFrom] },
      };
    }
    if (field.name === "to" && field.type === "group") return germanTo(field);
    return field;
  });
}

export const redirectsPluginOptions: RedirectsPluginConfig = {
  collections: ["pages"],
  redirectTypes: redirectTypeOptions.map((option) => option.value),
  redirectTypeFieldOverride: { label: "Art", defaultValue: "301", options: redirectTypeOptions.map((option) => ({ ...option })) },
  overrides: {
    labels: { singular: "Weiterleitung", plural: "Weiterleitungen" },
    admin: {
      group: "Inhalte",
      useAsTitle: "from",
      defaultColumns: ["from", "to.type", "type", "updatedAt"],
      description: "Greift nur, wenn unter dem alten Pfad keine Seite (mehr) liegt.",
    },
    // Lesen bleibt öffentlich (das Frontend braucht es), ändern nur mit Konto.
    access: { read: () => true, create: loggedIn, update: loggedIn, delete: loggedIn },
    fields: germanFields,
    hooks: { beforeValidate: [preventChains] },
  },
};

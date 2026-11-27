// Konten für das Admin-Panel. Das erste Konto legst du beim ersten Aufruf
// von /admin selbst an (Formular von Payload), mit dem Einrichtungscode aus
// dem Log (lib/setup-code.ts). Einen Standard-Login gibt es nicht.
import { APIError, type CollectionBeforeChangeHook, type CollectionConfig } from "payload";
import { payloadSecret } from "../lib/env.ts";
import { validSetupCode } from "../lib/setup-code.ts";

export const setupCodeMessage =
  "Einrichtungscode fehlt oder ist falsch. Du findest ihn im Log der Version: gooddeploy logs <deployment>.";

// Ein Konto ohne Anmeldung anlegen geht nur mit dem Einrichtungscode. Das
// betrifft nur das erste Konto: Payload lässt ohne Anmeldung sonst nichts
// anlegen, und sobald ein Konto existiert, lehnt es /api/users/first-register ab.
// Der Hook greift auch dort, obwohl Payload das erste Konto mit
// overrideAccess anlegt (Hooks laufen trotzdem).
export const requireSetupCode: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation !== "create") return data;
  const { setupCode, ...rest } = (data ?? {}) as Record<string, unknown>;
  if (!req.user && !validSetupCode(payloadSecret(), setupCode)) {
    throw new APIError(setupCodeMessage, 403);
  }
  return rest;
};

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Konto", plural: "Konten" },
  admin: { useAsTitle: "email", group: "Verwaltung" },
  auth: true,
  hooks: { beforeChange: [requireSetupCode] },
  fields: [
    { name: "name", label: "Name", type: "text" },
    {
      // Nur im Formular für das erste Konto (ohne Anmeldung), nie gespeichert.
      name: "setupCode",
      label: "Einrichtungscode",
      type: "text",
      virtual: true,
      admin: {
        // Virtuelle Felder sind im Admin-Panel sonst nur lesbar.
        readOnly: false,
        condition: (_data, _sibling, { user }) => !user,
        description: "Steht im Log der Version: gooddeploy logs <deployment>",
      },
    },
  ],
};

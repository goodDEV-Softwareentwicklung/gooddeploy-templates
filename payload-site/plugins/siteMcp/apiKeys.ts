// Sammlung der MCP-Schlüssel, nachgebaut nach `createAPIKeysCollection` aus
// `@payloadcms/plugin-mcp` 3.94.0 (MIT, Copyright Payload CMS, Inc.). Grund:
// Das Plugin lädt beim Import den ganzen MCP-Server; die Sammlung muss aber
// schon beim Start im Schema stehen. tests/site-mcp.test.ts vergleicht die
// Felder mit dem Original, damit ein Plugin-Update keine stille Abweichung
// erzeugt.
//
// Eigene Anpassungen: deutsche Beschriftung, Gruppe „Verwaltung“, Anleitung
// für Claude und andere Agents (components/admin/McpGuide.tsx), Freigaben für
// Veröffentlichen und Offline-Nehmen standardmäßig aus (optInTools), Lesen von
// Bildern, Bibliothek und Website-Einstellungen standardmäßig an, und der
// Schlüssel wird nur gehasht gespeichert (dropPlainKey).
import type { Access, CollectionBeforeChangeHook, CollectionConfig, Field } from "payload";
import { mcpCollections, mcpGlobals, optInTools, toolCatalog, type EntityOptions } from "./options.ts";

export const apiKeySlug = "payload-mcp-api-keys";

/** Anleitung im Admin-Panel (Liste und Bearbeiten), components/admin/McpGuide.tsx */
export const mcpGuideComponent = "/components/admin/McpGuide.tsx#McpGuide";
export const mcpGuideListComponent = "/components/admin/McpGuide.tsx#McpGuideList";

/** Wie `toCamelCase` im Plugin */
export const toCamelCase = (value: string): string =>
  value
    .replace(/[-_\s]+(.)?/g, (_, chr: string | undefined) => (chr ? chr.toUpperCase() : ""))
    .replace(/^(.)/, (_, chr: string) => chr.toLowerCase());

const operations = {
  collection: [
    { name: "find", label: "Lesen" },
    { name: "create", label: "Anlegen" },
    { name: "update", label: "Ändern" },
    { name: "delete", label: "Löschen" },
  ],
  global: [
    { name: "find", label: "Lesen" },
    { name: "update", label: "Ändern (wirkt sofort, ohne Entwurf)" },
  ],
} as const;

function entityFields(config: Record<string, EntityOptions>, type: "collection" | "global"): Field[] {
  return Object.entries(config)
    .map(([slug, entity]) => ({
      slug,
      entity,
      enabled: operations[type].filter((operation) => (entity.enabled as Record<string, boolean | undefined>)[operation.name] === true),
    }))
    .filter(({ enabled }) => enabled.length > 0)
    .map(({ slug, entity, enabled }) => ({
      type: "collapsible",
      admin: { position: "sidebar" },
      label: entity.label,
      fields: [
        {
          name: toCamelCase(slug),
          type: "group",
          label: false,
          fields: enabled.map((operation) => ({
            name: operation.name,
            type: "checkbox",
            // Lesen ist vorausgewählt; Ändern (das Global „Website“ hat keine Entwürfe, wirkt sofort) bewusst ankreuzen.
            defaultValue: operation.name === "find",
            label: operation.label,
          })),
        },
      ],
    }));
}

/**
 * Nur der Hash bleibt (E228, ST-14-14): Payload berechnet aus dem Schlüssel
 * vorher (beforeValidate des Felds) den HMAC `apiKeyIndex`, über den das
 * Plugin Schlüssel findet. Den Klartext würde Payload danach verschlüsselt
 * (umkehrbar) in `apiKey` ablegen; dieser Hook läuft vor den Hooks der Felder
 * und nimmt ihn heraus. Den Schlüssel sieht man darum nur einmal, beim Erzeugen.
 * `null` (Widerrufen) bleibt stehen.
 */
export const dropPlainKey: CollectionBeforeChangeHook = ({ data }) => {
  if (data && typeof data.apiKey === "string") delete data.apiKey;
  return data;
};

export function apiKeysCollection(userCollection = "users"): CollectionConfig {
  const isAuthenticated: Access = ({ req }) => Boolean(req.user && req.user.collection === userCollection);
  const restrictToOwnKeys: Access = ({ req }) => (req.user && req.user.collection === userCollection ? { user: { equals: req.user.id } } : false);

  return {
    slug: apiKeySlug,
    labels: { singular: "MCP-Schlüssel", plural: "MCP-Schlüssel" },
    access: {
      // Jeder angemeldete Benutzer verwaltet nur eigene Schlüssel (wie im Plugin).
      create: isAuthenticated,
      delete: restrictToOwnKeys,
      read: restrictToOwnKeys,
      unlock: restrictToOwnKeys,
      update: restrictToOwnKeys,
    },
    admin: {
      description:
        "Schlüssel für Claude und andere KI-Assistenten (MCP). Ein Schlüssel hat höchstens die Rechte deines Kontos; Veröffentlichen und Offline-Nehmen gibst du je Schlüssel frei.",
      group: "Verwaltung",
      useAsTitle: "label",
      defaultColumns: ["label", "description", "updatedAt"],
      components: { beforeListTable: [mcpGuideListComponent] },
    },
    auth: { disableLocalStrategy: true, useAPIKey: true },
    hooks: { beforeChange: [dropPlainKey] },
    fields: [
      {
        name: "user",
        type: "relationship",
        label: "Konto",
        // Schlüssel gehört dem Ersteller und lässt sich nicht umhängen (sonst Identitätswechsel).
        access: { create: () => false, update: () => false },
        admin: { description: "Das Konto, dessen Rechte der Schlüssel hat." },
        defaultValue: ({ req }) => (req.user && req.user.collection === userCollection ? req.user.id : undefined),
        relationTo: userCollection as "users",
        required: true,
      },
      { name: "label", type: "text", label: "Name", admin: { description: "z. B. Claude Desktop auf meinem Laptop" } },
      { name: "description", type: "text", label: "Zweck", admin: { description: "Wofür der Schlüssel gedacht ist." } },
      // Anleitung mit Adresse und Einträgen für Claude Desktop, Claude Code und andere Agents.
      { name: "guide", type: "ui", admin: { components: { Field: mcpGuideComponent } } },
      ...entityFields(mcpCollections, "collection"),
      ...entityFields(mcpGlobals, "global"),
      {
        type: "collapsible",
        admin: { description: "Welche Werkzeuge der Assistent nutzen darf", position: "sidebar" },
        label: "Werkzeuge",
        fields: [
          {
            name: "payload-mcp-tool",
            type: "group",
            label: false,
            fields: toolCatalog.map((tool) => {
              const name = toCamelCase(tool.name);
              return {
                name,
                type: "checkbox",
                admin: { description: tool.description },
                defaultValue: !optInTools.has(name),
                label: tool.name,
              };
            }),
          },
        ],
      },
    ],
  };
}

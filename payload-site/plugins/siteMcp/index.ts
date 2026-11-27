// Plugin „Website per Claude pflegen“ (ST-14-14, E228) um das offizielle
// `@payloadcms/plugin-mcp`. Endpunkt /api/mcp, Zugriff nur mit MCP-Schlüssel
// (Admin-Panel → Verwaltung → MCP-Schlüssel); jeder Schlüssel gehört einem Konto
// und hat höchstens dessen Rechte.
//
// Speicher: Beim Start werden nur die Sammlungen (Schlüssel, Upload-Links) und
// die Endpunkte angemeldet (options.ts, apiKeys.ts, upload.ts, ohne MCP-SDK).
// Den MCP-Server (server.ts) lädt erst der erste Aufruf von /api/mcp.
// SITE_MCP=false meldet die Endpunkte gar nicht an; die Sammlungen bleiben,
// damit das Schema zu den Migrationen passt.
//
// Bewusst nicht freigegeben: Konten, Schlüssel, Personen (personenbezogen),
// generisches Anlegen und Ändern von Seiten (dafür create_page/update_page mit
// Markdown und Entwurf), experimentelle Werkzeuge des Plugins. Veröffentlichen
// und Offline-Nehmen muss je Schlüssel ausdrücklich angekreuzt werden.
import type { CollectionBeforeDeleteHook, Endpoint, PayloadHandler, PayloadRequest, Plugin } from "payload";
import { apiKeySlug, apiKeysCollection } from "./apiKeys.ts";
import { hasBearer, limitDepth, readLimitedText } from "./request.ts";
import { uploadEndpoint, UploadTokens, uploadTokenSlug } from "./upload.ts";

/**
 * Schlüssel und Upload-Links eines Kontos vor dessen Löschung entfernen: Die
 * Spalte `user_id` der Schlüssel ist NOT NULL mit ON DELETE SET NULL, das
 * Löschen scheiterte sonst.
 */
export const deleteUserKeys: CollectionBeforeDeleteHook = async ({ id, req }) => {
  for (const collection of [apiKeySlug, uploadTokenSlug] as const) {
    await req.payload.delete({ collection, where: { user: { equals: id } }, req, overrideAccess: true });
  }
};

let handlers: Promise<{ post: PayloadHandler; get: PayloadHandler }> | undefined;

/** Lädt den MCP-Server beim ersten Aufruf und behält ihn danach */
function loadHandlers() {
  handlers ??= import("./server.ts").then((server) => server.createMcpHandlers());
  handlers.catch(() => {
    handlers = undefined;
  });
  return handlers;
}

const json = (status: number, error: string) => Response.json({ error }, { status, headers: { "cache-control": "no-store" } });

/**
 * Vor dem Plugin: Ohne Schlüssel im Header antwortet der Endpunkt sofort 401,
 * ohne den Inhalt zu lesen. Mit Schlüssel wird höchstens 1 MB gelesen (sonst
 * 413), dann die Tiefe begrenzt (request.ts) und der Inhalt ersetzt; das Plugin
 * liest `req.body` als Strom und prüft den Schlüssel selbst. Ungültiges JSON
 * bleibt, wie es ist (das Plugin antwortet dann mit einem Fehler).
 */
async function beforePost(req: PayloadRequest): Promise<Response | PayloadRequest> {
  if (!hasBearer(req.headers.get("authorization"))) return json(401, "MCP-Schlüssel fehlt (Header Authorization: Bearer …).");
  const text = await readLimitedText(req.body as ReadableStream<Uint8Array> | null, req.headers.get("content-length"));
  if (text === "too-large") return json(413, "Anfrage ist zu groß (höchstens 1 MB).");
  let body = text;
  try {
    body = JSON.stringify(limitDepth(JSON.parse(text)));
  } catch {
    // kein JSON
  }
  Object.defineProperty(req, "body", { value: new Blob([body]).stream(), configurable: true });
  return req;
}

const lazyEndpoint = (method: "post" | "get"): Endpoint => ({
  path: "/mcp",
  method,
  handler: async (req) => {
    if (method === "get") return (await loadHandlers()).get(req);
    const checked = await beforePost(req);
    return checked instanceof Response ? checked : (await loadHandlers()).post(checked);
  },
});

export type SiteMcpOptions = { disabled?: boolean };

export function siteMcp(options: SiteMcpOptions = {}): Plugin {
  return (config) => ({
    ...config,
    endpoints: [...(config.endpoints ?? []), ...(options.disabled ? [] : [lazyEndpoint("post"), lazyEndpoint("get"), uploadEndpoint])],
    collections: [...(config.collections ?? []), apiKeysCollection("users"), UploadTokens].map((collection) =>
      collection.slug === "users"
        ? { ...collection, hooks: { ...collection.hooks, beforeDelete: [...(collection.hooks?.beforeDelete ?? []), deleteUserKeys] } }
        : collection,
    ),
  });
}

/**
 * Einmaliger Upload-Link für Bilder (MCP-Werkzeug `request_image_upload`):
 * Der Client lädt die Datei direkt per HTTP hoch, nicht über die KI.
 *
 * - Token: 256 Bit Zufall, in der DB nur als SHA-256, gültig 10 Minuten, genau einmal:
 *   Einlösen ist ein einziges `DELETE … RETURNING` in Postgres; bei zwei gleichzeitigen
 *   Versuchen bekommt nur einer die Zeile.
 * - Gebunden an Konto und MCP-Schlüssel: Beim Einlösen muss der Schlüssel noch gelten
 *   (nicht widerrufen oder gelöscht) und `request_image_upload` erlauben.
 * - Inhalt: `sanitizeImage` (Typ an den Bytes, neu kodiert, Grenzen), Name vom Server.
 * - Rechte: die des Benutzers, dem der MCP-Schlüssel gehört (`overrideAccess: false`).
 */
import { createHash, randomBytes } from "node:crypto";
import type { CollectionConfig, Endpoint, Payload, PayloadRequest } from "payload";
import { maxUploadBytes, sanitizeImage } from "./sanitizeImage.ts";

/** ID des MCP-Schlüssels der Anfrage in `req.context` (gesetzt in server.ts, overrideAuth) */
export const mcpKeyContext = "siteMcpKeyId";

export const uploadTokenSlug = "mcp-upload-tokens";
export const uploadTokenMinutes = 10;

const nobody = () => false;

/** Nur Server-intern (Zugriff ausschließlich mit overrideAccess), im Admin unsichtbar */
export const UploadTokens: CollectionConfig = {
  slug: uploadTokenSlug,
  labels: { singular: "Upload-Link", plural: "Upload-Links" },
  admin: { hidden: true },
  access: { read: nobody, create: nobody, update: nobody, delete: nobody },
  fields: [
    { name: "tokenHash", type: "text", required: true, unique: true, index: true },
    { name: "user", type: "relationship", relationTo: "users" },
    { name: "mcpKey", type: "relationship", relationTo: "payload-mcp-api-keys" },
    { name: "alt", type: "text", required: true },
    { name: "expiresAt", type: "date", required: true, index: true },
  ],
};

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Legt einen Upload-Link an und räumt abgelaufene auf; gibt das Klartext-Token zurück */
export async function createUploadToken(req: PayloadRequest, alt: string, now = new Date()): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + uploadTokenMinutes * 60_000);
  await req.payload.delete({
    collection: uploadTokenSlug,
    where: { expiresAt: { less_than: now.toISOString() } },
    overrideAccess: true,
    req,
  });
  await req.payload.create({
    collection: uploadTokenSlug,
    data: {
      tokenHash: hashToken(token),
      user: req.user?.id,
      mcpKey: req.context?.[mcpKeyContext] as number | undefined,
      alt,
      expiresAt: expiresAt.toISOString(),
    },
    overrideAccess: true,
    req,
  });
  return { token, expiresAt };
}

export type UploadResult =
  | {
      status: 201;
      body: { id: number | string; filename?: string | null; alt: string; url?: string | null };
    }
  | { status: 400 | 404 | 410 | 413 | 415 | 403; body: { error: string } };

/** SQL: Token genau einmal einlösen (atomar) */
export const redeemTokenSql = "DELETE FROM mcp_upload_tokens WHERE token_hash = $1 RETURNING user_id, mcp_key_id, alt, expires_at";

/** SQL: Schlüssel gilt noch, gehört dem Konto und erlaubt den Upload-Link */
export const keyStillValidSql =
  "SELECT 1 FROM payload_mcp_api_keys WHERE id = $1 AND user_id = $2 AND api_key_index IS NOT NULL AND payload_mcp_tool_request_image_upload";

type Pool = { query: (sql: string, params: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> };

/** Löst ein Token ein und legt das bereinigte Bild an (Kern des Endpunkts, ohne HTTP) */
export async function redeemUpload(payload: Payload, token: string, bytes: Uint8Array, now = new Date()): Promise<UploadResult> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return { status: 404, body: { error: "Unbekannter Upload-Link." } };
  const pool = (payload.db as unknown as { pool: Pool }).pool;
  const { rows } = await pool.query(redeemTokenSql, [hashToken(token)]);
  const row = rows[0];
  if (!row) return { status: 404, body: { error: "Unbekannter oder schon benutzter Upload-Link." } };
  const record = {
    user: row.user_id as number | null,
    key: row.mcp_key_id as number | null,
    alt: String(row.alt),
    expiresAt: new Date(row.expires_at as string),
  };
  if (record.expiresAt < now) return { status: 410, body: { error: "Upload-Link ist abgelaufen." } };
  if (!record.user || !record.key) return { status: 403, body: { error: "Upload-Link ohne Konto oder Schlüssel." } };
  const valid = await pool.query(keyStillValidSql, [record.key, record.user]);
  if (valid.rows.length === 0) return { status: 403, body: { error: "Der MCP-Schlüssel dieses Upload-Links gilt nicht mehr." } };
  if (bytes.length === 0) return { status: 400, body: { error: "Leere Datei." } };
  if (bytes.length > maxUploadBytes) return { status: 413, body: { error: "Bild ist größer als 10 MB." } };

  const clean = await sanitizeImage(bytes);
  if ("error" in clean) return { status: 415, body: { error: clean.error } };

  const user = await payload.findByID({
    collection: "users",
    id: record.user,
    depth: 0,
    overrideAccess: true,
  });
  const stamp = now.toISOString().slice(0, 19).replace(/[-:T]/g, "");
  try {
    const media = await payload.create({
      collection: "media",
      data: { alt: record.alt },
      file: {
        data: clean.data,
        mimetype: clean.mimetype,
        name: `upload-${stamp}.${clean.extension}`,
        size: clean.data.length,
      },
      user: { ...user, collection: "users" } as never,
      overrideAccess: false,
      depth: 0,
    });
    return {
      status: 201,
      body: { id: media.id, filename: media.filename, alt: media.alt, url: media.url },
    };
  } catch (error) {
    const status = (error as { status?: number })?.status === 403 ? 403 : 400;
    return { status, body: { error: error instanceof Error ? error.message : String(error) } };
  }
}

/** Liest den Rohinhalt mit hartem Limit (auch ohne oder mit falschem Content-Length) */
async function readLimited(req: PayloadRequest, limit: number): Promise<Uint8Array | "too-large"> {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > limit) return "too-large";
  const stream = (req as unknown as Request).body;
  if (!stream) return new Uint8Array();
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > limit) {
      await reader.cancel();
      return "too-large";
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

const json = (status: number, body: unknown) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

/** POST /api/mcp-upload/:token mit dem Bild als Rohinhalt (curl --data-binary @bild.jpg) */
export const uploadEndpoint: Endpoint = {
  path: "/mcp-upload/:token",
  method: "post",
  handler: async (req) => {
    const token = String(req.routeParams?.token ?? "");
    const bytes = await readLimited(req, maxUploadBytes);
    if (bytes === "too-large") return json(413, { error: "Bild ist größer als 10 MB." });
    const result = await redeemUpload(req.payload, token, bytes);
    return json(result.status, result.body);
  },
};

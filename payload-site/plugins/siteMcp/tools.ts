// Eigene MCP-Werkzeuge. Jedes Werkzeug arbeitet über die Local API mit dem
// Konto des MCP-Schlüssels (`req.user`, `overrideAccess: false`): Zugriffsregeln,
// Prüfungen, Hooks und Versionen gelten wie im Admin-Panel. Seiten landen immer
// als Entwurf (ST-14-13); veröffentlicht wird nur mit publish_page, und das nur,
// wenn der Schlüssel dafür freigegeben ist. Gelesen wird mit depth 0: Personen
// und andere Verweise kommen nur als ID zurück, nie mit Namen oder Kontaktdaten.
import { convertLexicalToMarkdown, convertMarkdownToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import type { Block, Field, PayloadRequest, RichTextField } from "payload";
import { ValidationError } from "payload";
import { z } from "zod";
import { uploadsOffMessage } from "../../collections/Media.ts";
import { s3Settings } from "../../lib/env.ts";
import { pagePath, requestOrigin } from "../../lib/paths.ts";
import { previewPath } from "../../lib/preview.ts";
import { blocksOf, dataFields, describeFields, mapRichText, missingRequired, withoutStatus } from "./fields.ts";
import { fetchImage } from "./imageUrl.ts";
import { sanitizeImage } from "./sanitizeImage.ts";
import { createUploadToken, uploadTokenMinutes } from "./upload.ts";

type ToolResult = { content: { type: "text"; text: string }[] };

export type SiteMcpTool = {
  name: string;
  description: string;
  parameters: z.ZodRawShape;
  handler: (args: Record<string, unknown>, req: PayloadRequest, extra: unknown) => Promise<ToolResult>;
};

const ok = (value: unknown): ToolResult => ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }] });
const fail = (message: string): ToolResult => ({ content: [{ type: "text", text: `Fehler: ${message}` }] });

/** Fehler verständlich für die KI, Feldfehler mit Pfad */
function explain(error: unknown): ToolResult {
  if (error instanceof ValidationError) {
    const fields = error.data.errors.map((e) => `${e.path}: ${e.message}`).join("\n");
    return fail(`Ungültige Daten.\n${fields}`);
  }
  const status = (error as { status?: number })?.status;
  if (status === 403) return fail("Keine Berechtigung für diese Aktion (Rechte des Kontos am MCP-Schlüssel).");
  if (status === 404) return fail("Nicht gefunden.");
  return fail(error instanceof Error ? error.message : String(error));
}

const collection = "pages";

function pageFields(req: PayloadRequest): Field[] {
  return req.payload.collections[collection].config.fields;
}

function sharedBlocks(req: PayloadRequest): Block[] {
  return (req.payload.config.blocks ?? []) as Block[];
}

const toLexical = (value: unknown, field: Field) =>
  typeof value === "string"
    ? convertMarkdownToLexical({ editorConfig: editorConfigFactory.fromField({ field: field as RichTextField }), markdown: value })
    : value;

const toMarkdown = (value: unknown, field: Field) =>
  value && typeof value === "object" && "root" in value
    ? convertLexicalToMarkdown({
        data: value as Parameters<typeof convertLexicalToMarkdown>[0]["data"],
        editorConfig: editorConfigFactory.fromField({ field: field as RichTextField }),
      })
    : value;

const layoutDescription =
  'Liste von Modulen der Seite laut describe_blocks. Jedes Modul: {"blockType": "<slug>", ...Felder}. ' +
  "Fließtextfelder (Hinweis „Markdown“) als Markdown-String, Bilder als Medien-ID.";

const describeBlocks: SiteMcpTool = {
  name: "describe_blocks",
  description: "Zeigt alle Module (Blöcke), aus denen Seiten gebaut werden, mit ihren Feldern. Vor create_page oder update_page aufrufen.",
  parameters: {},
  handler: async (_args, req) => {
    const shared = sharedBlocks(req);
    const layout = dataFields(pageFields(req)).find((f) => f.name === "layout");
    const pageBlocks = layout ? blocksOf(layout, shared) : [];
    const all = new Map<string, Block>();
    const collect = (blocks: Block[]) => {
      for (const block of blocks) {
        if (all.has(block.slug)) continue;
        all.set(block.slug, block);
        for (const field of dataFields(block.fields)) {
          if (field.type === "blocks") collect(blocksOf(field, shared));
          if (field.type === "array") {
            for (const inner of dataFields(field.fields ?? [])) {
              if (inner.type === "blocks") collect(blocksOf(inner, shared));
            }
          }
        }
      }
    };
    collect(pageBlocks);
    const thumbnailAlt = (block: Block) => {
      const thumbnail = block.admin?.images?.thumbnail;
      return typeof thumbnail === "object" ? thumbnail.alt : undefined;
    };
    const label = (block: Block) => {
      const singular = block.labels?.singular;
      return typeof singular === "string" ? singular : block.slug;
    };
    return ok({
      pageBlocks: pageBlocks.map((b) => b.slug),
      nesting: "Seite → Modul, oder Seite → Abschnitt (section) → Spalten (columns) → Module. Keine Abschnitte und kein Hero in Spalten.",
      blocks: Object.fromEntries(
        [...all.values()].map((block) => [
          block.slug,
          { label: label(block), description: thumbnailAlt(block), fields: describeFields(block.fields, shared) },
        ]),
      ),
    });
  },
};

/** Felder, die ein Client setzen darf (SEO und Status pflegen Payload und das Admin-Panel) */
const pageInput = {
  title: z.string().min(1).describe("Titel der Seite"),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .describe("Adresse der Seite, nur Kleinbuchstaben, Ziffern und Bindestriche, z. B. ueber-uns (/ueber-uns); home ist die Startseite"),
  layout: z.array(z.record(z.unknown())).describe(layoutDescription),
};
const keys = Object.keys(pageInput);
const optionalInput = Object.fromEntries(Object.entries(pageInput).map(([key, schema]) => [key, (schema as z.ZodTypeAny).optional()]));
const id = z.union([z.number(), z.string()]).describe("ID der Seite");

/** Adressen für die Person: Bearbeiten im Admin-Panel und Vorschau des Entwurfs (mit Anmeldung) */
export function pageLinks(origin: string, doc: { id: number | string; slug?: string | null }) {
  return { admin: `${origin}/admin/collections/${collection}/${doc.id}`, preview: `${origin}${previewPath(doc.slug)}` };
}
const links = (req: PayloadRequest, doc: { id: number | string; slug?: string | null }) => pageLinks(requestOrigin(req.headers), doc);

const listPages: SiteMcpTool = {
  name: "list_pages",
  description: "Listet alle Seiten mit ID, Titel, Pfad und Status (veröffentlicht oder Entwurf).",
  parameters: {},
  handler: async (_args, req) => {
    const { docs } = await req.payload.find({ collection, draft: true, depth: 0, pagination: false, sort: "title", req, overrideAccess: false });
    return ok(docs.map((doc) => ({ id: doc.id, title: doc.title, path: pagePath(doc.slug), status: doc._status })));
  },
};

const readPage: SiteMcpTool = {
  name: "read_page",
  description: "Liest eine Seite (neuester Stand, auch Entwurf); Fließtext als Markdown.",
  parameters: { id: id.optional(), slug: z.string().optional().describe("Alternativ: Adresse (slug), z. B. ueber-uns") },
  handler: async (args, req) => {
    if (args.id === undefined && !args.slug) return fail("id oder slug angeben.");
    try {
      const { docs } = await req.payload.find({
        collection,
        where: args.id !== undefined ? { id: { equals: args.id } } : { slug: { equals: args.slug } },
        draft: true,
        depth: 0,
        limit: 1,
        req,
        overrideAccess: false,
      });
      const doc = docs[0];
      if (!doc) return fail("Seite nicht gefunden.");
      const readable = mapRichText(pageFields(req), doc, toMarkdown, sharedBlocks(req));
      return ok({ ...readable, links: links(req, doc) });
    } catch (error) {
      return explain(error);
    }
  },
};

const createPage: SiteMcpTool = {
  name: "create_page",
  description: "Legt eine Seite als Entwurf an (nicht öffentlich). Danach den Vorschau-Link zeigen.",
  parameters: pageInput,
  handler: async (args, req) => {
    const input = withoutStatus(Object.fromEntries(keys.map((key) => [key, args[key]])));
    const missing = missingRequired(pageFields(req), input, sharedBlocks(req));
    if (missing.length) return fail(`Pflichtfelder fehlen:\n${missing.join("\n")}`);
    try {
      const data = mapRichText(pageFields(req), input, toLexical, sharedBlocks(req));
      const doc = await req.payload.create({
        collection,
        data: { ...data, _status: "draft" } as never,
        draft: true,
        depth: 0,
        req,
        overrideAccess: false,
      });
      return ok({ id: doc.id, title: doc.title, path: pagePath(doc.slug), status: "draft", links: links(req, doc) });
    } catch (error) {
      return explain(error);
    }
  },
};

const updatePage: SiteMcpTool = {
  name: "update_page",
  description:
    "Ändert eine Seite als neuen Entwurf (die veröffentlichte Fassung bleibt bis zum Veröffentlichen). " +
    "layout ersetzt die bisherigen Module; vorher lesen und vollständig zurückgeben.",
  parameters: { id, ...optionalInput },
  handler: async (args, req) => {
    try {
      const changes: Record<string, unknown> = {};
      for (const key of keys) if (args[key] !== undefined) changes[key] = args[key];
      if (Object.keys(changes).length === 0) return fail("Nichts zu ändern.");
      // Nur geänderte Teile prüfen (diese sind dann vollständig angegeben).
      const checked = dataFields(pageFields(req)).filter((f) => f.name! in changes);
      const missing = missingRequired(checked, changes, sharedBlocks(req));
      if (missing.length) return fail(`Pflichtfelder fehlen:\n${missing.join("\n")}`);
      const data = mapRichText(pageFields(req), changes, toLexical, sharedBlocks(req));
      const doc = await req.payload.update({
        collection,
        id: args.id as number,
        data: { ...data, _status: "draft" } as never,
        draft: true,
        depth: 0,
        req,
        overrideAccess: false,
      });
      return ok({ id: doc.id, title: doc.title, status: "draft", links: links(req, doc) });
    } catch (error) {
      return explain(error);
    }
  },
};

const publishPage: SiteMcpTool = {
  name: "publish_page",
  description:
    "Veröffentlicht den neuesten Entwurf einer Seite, danach öffentlich sichtbar. " +
    "Nur aufrufen, wenn die Person es ausdrücklich will, nachdem sie die Vorschau gesehen hat.",
  parameters: { id },
  handler: async (args, req) => {
    try {
      // Neuester Stand inklusive Entwurf; veröffentlicht wird genau dieser Inhalt.
      const latest = await req.payload.findByID({ collection, id: args.id as number, draft: true, depth: 0, req, overrideAccess: false });
      const { id: docId, createdAt: _c, updatedAt: _u, ...data } = latest;
      // Ohne Entwurf prüft Payload alle Pflichtfelder selbst.
      const doc = await req.payload.update({
        collection,
        id: docId,
        data: { ...data, _status: "published" } as never,
        draft: false,
        depth: 0,
        req,
        overrideAccess: false,
      });
      return ok({ id: doc.id, title: doc.title, status: doc._status, url: `${requestOrigin(req.headers)}${pagePath(doc.slug)}` });
    } catch (error) {
      return explain(error);
    }
  },
};

const unpublishPage: SiteMcpTool = {
  name: "unpublish_page",
  description: "Nimmt eine Seite offline (wieder Entwurf, Inhalt bleibt); Besucher sehen sie nicht mehr. Nur auf ausdrücklichen Wunsch der Person.",
  parameters: { id },
  handler: async (args, req) => {
    try {
      const doc = await req.payload.update({
        collection,
        id: args.id as number,
        data: { _status: "draft" } as never,
        draft: false,
        depth: 0,
        req,
        overrideAccess: false,
      });
      return ok({ id: doc.id, title: doc.title, status: doc._status, links: links(req, doc) });
    } catch (error) {
      return explain(error);
    }
  },
};

const importImage: SiteMcpTool = {
  name: "import_image",
  description:
    "Übernimmt ein Bild von einer öffentlichen https-Adresse in die Bilder der Website und gibt die Medien-ID zurück. " +
    "Nur Bilder, die das Unternehmen verwenden darf (Rechte beachten). Geht nur mit S3-Speicher.",
  parameters: {
    url: z.string().url().describe("https-Adresse des Bildes (JPEG, PNG, WebP, GIF, AVIF, höchstens 10 MB)"),
    alt: z.string().min(3).describe("Alternativtext: was ist auf dem Bild zu sehen (Pflicht, Barrierefreiheit)"),
  },
  handler: async (args, req) => {
    if (!s3Settings()) return fail(uploadsOffMessage);
    let image: Awaited<ReturnType<typeof fetchImage>>;
    try {
      image = await fetchImage(String(args.url));
    } catch {
      return fail("Abruf fehlgeschlagen.");
    }
    if ("error" in image) return fail(image.error);
    // Wie beim Upload-Link: Typ an den Bytes prüfen und neu kodieren.
    const clean = await sanitizeImage(image.data);
    if ("error" in clean) return fail(clean.error);
    try {
      const media = await req.payload.create({
        collection: "media",
        data: { alt: String(args.alt) },
        file: {
          data: clean.data,
          mimetype: clean.mimetype,
          name: image.name.replace(/\.[a-z0-9]+$/i, `.${clean.extension}`),
          size: clean.data.length,
        },
        depth: 0,
        req,
        overrideAccess: false,
      });
      return ok({ id: media.id, filename: media.filename, alt: media.alt, url: media.url });
    } catch (error) {
      return explain(error);
    }
  },
};

const requestImageUpload: SiteMcpTool = {
  name: "request_image_upload",
  description:
    `Für ein Bild, das als Datei vorliegt (nicht im Internet): gibt einen einmaligen Upload-Link zurück, gültig ${uploadTokenMinutes} Minuten. ` +
    'Die Datei dann per HTTP-POST als Rohinhalt hochladen, z. B. `curl -sS -X POST --data-binary @bild.jpg "<uploadUrl>"`. ' +
    "Die Antwort enthält die Medien-ID. Nicht den Dateiinhalt an dieses Werkzeug übergeben. Geht nur mit S3-Speicher.",
  parameters: { alt: z.string().min(3).describe("Alternativtext: was ist auf dem Bild zu sehen (Pflicht)") },
  handler: async (args, req) => {
    if (!s3Settings()) return fail(uploadsOffMessage);
    if (!req.user) return fail("Kein Konto am Schlüssel.");
    const { token, expiresAt } = await createUploadToken(req, String(args.alt));
    const uploadUrl = `${requestOrigin(req.headers)}/api/mcp-upload/${token}`;
    return ok({
      uploadUrl,
      method: "POST",
      body: "Bilddatei als Rohinhalt (kein Formular), JPEG, PNG, WebP, GIF oder AVIF, höchstens 10 MB",
      example: `curl -sS -X POST --data-binary @bild.jpg "${uploadUrl}"`,
      expiresAt: expiresAt.toISOString(),
      singleUse: true,
    });
  },
};

export const siteMcpTools: SiteMcpTool[] = [
  describeBlocks,
  listPages,
  readPage,
  createPage,
  updatePage,
  publishPage,
  unpublishPage,
  importImage,
  requestImageUpload,
];

// Payload: Sammlungen, Global „Website“, Datenbank, Uploads. Läuft im selben Prozess wie
// Next.js; das Admin-Panel liegt unter /admin, die API unter /api.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { redirectsPlugin } from "@payloadcms/plugin-redirects";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { s3Storage } from "@payloadcms/storage-s3";
import { de } from "@payloadcms/translations/languages/de";
import { buildConfig } from "payload";
import sharp from "sharp";

import { maxUploadBytes, mediaCollection } from "./collections/Media.ts";
import { Pages } from "./collections/Pages.ts";
import { People } from "./collections/People.ts";
import { redirectsPluginOptions } from "./collections/Redirects.ts";
import { ReusableBlocks } from "./collections/ReusableBlocks.ts";
import { Users } from "./collections/Users.ts";
import { seoPluginOptions } from "./fields/seo.ts";
import { SiteSettings } from "./globals/SiteSettings.ts";
import { databaseUrl, mcpEnabled, payloadSecret, s3Settings } from "./lib/env.ts";
import { siteIconPath } from "./lib/favicon.ts";
import { livePreviewUrl, previewBreakpoints } from "./lib/preview.ts";
import { migrations } from "./migrations/index.ts";
import { siteMcp } from "./plugins/siteMcp/index.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const s3 = s3Settings();

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    // Favicon der Website auch im Admin-Panel (statt des Payload-Logos, E228).
    meta: { titleSuffix: " · Website", icons: [{ rel: "icon", type: "image/png", url: siteIconPath }] },
    // Logo bzw. Icon der Website im Kopf und auf der Anmeldeseite statt des Payload-Logos.
    components: {
      graphics: { Logo: "/components/admin/AdminGraphics.tsx#AdminLogo", Icon: "/components/admin/AdminGraphics.tsx#AdminIcon" },
    },
    // Live-Vorschau neben dem Formular, beim ersten Öffnen einer Seite offen
    // (danach merkt sich Payload je Konto, ob sie an oder aus ist).
    livePreview: { collections: ["pages"], url: livePreviewUrl, breakpoints: previewBreakpoints, openByDefault: true },
  },
  i18n: { supportedLanguages: { de }, fallbackLanguage: "de" },
  collections: [Pages, ReusableBlocks, People, mediaCollection(Boolean(s3)), Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  // Nur REST (/api) und Local API; GraphQL braucht die Vorlage nicht.
  graphQL: { disable: true },
  secret: payloadSecret(),
  telemetry: false,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    // Pool je Instanz; über DATABASE_URL arbeiten höchstens 5 Verbindungen je
    // Datenbank gleichzeitig, wartende reihen sich ein. Payload hält beim
    // Speichern eine Transaktion offen und fragt daneben weiter ab, darum
    // nicht weniger als 5.
    pool: { connectionString: databaseUrl(), max: 10 },
    // Tabellen nur über Migrationen (migrations/), nie automatisch ändern.
    push: false,
    migrationDir: path.resolve(dirname, "migrations"),
    // Beim Start einspielen (instrumentation.ts, lib/migrate-on-start.ts).
    prodMigrations: migrations,
  }),
  sharp,
  // Größere Dateien lehnt Payload mit 413 ab, bevor etwas gespeichert wird.
  upload: {
    limits: { fileSize: maxUploadBytes },
    responseOnLimit: `Die Datei ist zu groß (höchstens ${maxUploadBytes / 1024 / 1024} MB).`,
  },
  plugins: [
    // Knöpfe „Erzeugen“ und Vorschau für die SEO-Felder der Seiten (fields/seo.ts)
    seoPlugin(seoPluginOptions),
    // Sammlung `redirects`; angewendet im Frontend, wenn ein Pfad keine Seite hat
    redirectsPlugin(redirectsPluginOptions),
    // Website per Claude pflegen: /api/mcp mit MCP-Schlüsseln (plugins/siteMcp); SITE_MCP=false schaltet es ab.
    siteMcp({ disabled: !mcpEnabled() }),
    s3Storage({
      enabled: Boolean(s3),
      // Gleiche Tabellen mit und ohne S3: Die Migrationen hängen nicht davon ab.
      alwaysInsertFields: true,
      collections: { media: true },
      bucket: s3?.bucket ?? "",
      config: {
        endpoint: s3?.endpoint,
        region: s3?.region,
        forcePathStyle: s3?.forcePathStyle,
        credentials: { accessKeyId: s3?.accessKeyId ?? "", secretAccessKey: s3?.secretAccessKey ?? "" },
      },
    }),
  ],
});

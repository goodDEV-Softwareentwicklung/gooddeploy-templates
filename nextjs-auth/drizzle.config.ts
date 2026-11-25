// Konfiguration für drizzle-kit (Migrationen erzeugen). Migrationen laufen
// immer über die direkte Verbindung DATABASE_URL_UNPOOLED.
import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Lokal: Werte aus .env.development.local wie bei next dev.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "" },
});

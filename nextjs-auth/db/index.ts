// Verbindung für alle normalen Abfragen der App über DATABASE_URL (auf
// gooddeploy über den Verbindungs-Pool). Migrationen laufen getrennt über
// DATABASE_URL_UNPOOLED (scripts/migrate.mjs).
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DB = PostgresJsDatabase<typeof schema>;

// Eine Verbindung je Prozess, auch über das Neuladen bei `next dev` hinweg.
const cache = globalThis as unknown as { starterSql?: postgres.Sql; starterDb?: DB };

export function sql(): postgres.Sql {
  if (!cache.starterSql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL fehlt. Auf gooddeploy: gooddeploy db create, dann neu deployen. Lokal: .env.development.local anlegen (siehe README).",
      );
    }
    // Klein halten: Je Umgebung gibt es nur wenige gleichzeitig arbeitende
    // Verbindungen (Handbuch „Datenbank in deiner App nutzen“).
    cache.starterSql = postgres(url, { max: 5 });
  }
  return cache.starterSql;
}

function instance(): DB {
  cache.starterDb ??= drizzle(sql(), { schema });
  return cache.starterDb;
}

// db verbindet erst beim ersten Zugriff: Während `next build` gibt es
// DATABASE_URL nicht, und der Build soll trotzdem durchlaufen.
export const db: DB = new Proxy({} as DB, {
  get: (_target, prop) => Reflect.get(instance(), prop),
});

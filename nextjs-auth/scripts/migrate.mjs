// Spielt die Migrationen aus drizzle/ in die Datenbank ein, genau einmal,
// auch wenn mehrere Instanzen gleichzeitig starten.
//
// - Verbindung über DATABASE_URL_UNPOOLED (direkt, ohne Pool): Nur so hält
//   die Sperre über die ganze Sitzung. Fehlt sie (z. B. lokal), DATABASE_URL.
// - Sperre: pg_advisory_lock mit fester Nummer. Die zweite Instanz wartet,
//   bis die erste fertig ist, und findet dann nichts mehr zu tun; bereits
//   eingespielte Migrationen merkt sich Drizzle in drizzle.__drizzle_migrations.
//
// Aufruf: beim Start durch server.js, lokal mit `npm run db:migrate`.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { fileURLToPath } from "node:url";

// Beliebige, feste Nummer für diese App (pg_advisory_lock nimmt bigint).
const LOCK_KEY = 4_711_000_001n;
const folder = fileURLToPath(new URL("../drizzle", import.meta.url));

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error(
    "migrate: DATABASE_URL fehlt. Auf gooddeploy: gooddeploy db create, dann neu deployen. Lokal: .env.development.local (siehe README).",
  );
  process.exit(1);
}

// Eine einzige Verbindung: Sperre, Migrationen und Freigabe laufen in
// derselben Sitzung.
const sql = postgres(url, { max: 1, onnotice: () => {} });

async function applied() {
  const [row] = await sql`
    select to_regclass('drizzle.__drizzle_migrations') is not null as present`;
  if (!row.present) return 0;
  const [{ n }] = await sql`select count(*)::int as n from drizzle.__drizzle_migrations`;
  return n;
}

const started = Date.now();
try {
  // Warten auf die Sperre und lange Migrationen dürfen länger dauern als
  // die üblichen 30 Sekunden je Abfrage.
  await sql`set statement_timeout = '5min'`;
  await sql`select pg_advisory_lock(${LOCK_KEY.toString()}::bigint)`;
  try {
    const before = await applied();
    await migrate(drizzle(sql), { migrationsFolder: folder });
    const after = await applied();
    console.log(
      `migrate: ${after - before} neue Migration(en) eingespielt, ${after} insgesamt (${Date.now() - started} ms)`,
    );
  } finally {
    await sql`select pg_advisory_unlock(${LOCK_KEY.toString()}::bigint)`;
  }
} catch (err) {
  console.error("migrate: fehlgeschlagen:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}

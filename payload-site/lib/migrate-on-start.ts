// Start auf gooddeploy: Payload einmal initialisieren, bevor die erste
// Anfrage kommt. Dabei spielt Payload neue Migrationen ein (prodMigrations
// in payload.config.ts); beim ersten Start legt seedOnce Beispielinhalte an.
//
// Payload sperrt dabei nicht. Starten mehrere Instanzen gleichzeitig (Live
// auf zwei Knoten), wartet jede auf eine Sperre in Postgres
// (pg_advisory_lock). Die Sperre braucht eine durchgehende Sitzung, darum
// über DATABASE_URL_UNPOOLED; über den Pool hinge sie an einer fremden
// Verbindung. Die zweite Instanz findet danach nichts mehr zu tun; welche
// Migrationen eingespielt sind, steht in der Tabelle payload_migrations.
import pg from "pg";
import { getPayload, type Payload } from "payload";
import { missingS3Variables, payloadSecret, s3Settings, unpooledDatabaseUrl } from "./env.ts";
import { backfillPageVersions } from "./page-versions.ts";
import { seedDemo, shouldSeed } from "./seed.ts";
import { setupCode } from "./setup-code.ts";

// Beliebige, feste Nummer für diese App (pg_advisory_lock nimmt bigint).
const lockKey = "4711000002";

async function count(client: pg.Client): Promise<number> {
  const { rows } = await client.query<{ present: boolean }>("select to_regclass('payload_migrations') is not null as present");
  if (!rows[0]?.present) return 0;
  // batch -1 trägt Payload für Schema-Änderungen ohne Migration ein (nur lokal mit push).
  const res = await client.query<{ n: number }>("select count(*)::int as n from payload_migrations where batch > 0");
  return res.rows[0]?.n ?? 0;
}

export async function migrateOnStart(): Promise<void> {
  payloadSecret(); // ohne PAYLOAD_SECRET mit klarer Meldung abbrechen
  const url = unpooledDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL fehlt. Auf gooddeploy: gooddeploy db create, dann neu deployen. Lokal: .env.development.local (siehe README).");
  }
  const missing = missingS3Variables();
  if (missing.length > 0) {
    console.warn(`start: S3 nur teilweise eingerichtet, es fehlt ${missing.join(", ")}; Hochladen bleibt aus.`);
  } else if (!s3Settings()) {
    console.log("start: kein S3-Speicher eingerichtet (S3_*), Hochladen ist aus.");
  }
  const started = Date.now();
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    // Warten auf die Sperre und lange Migrationen dürfen länger dauern als
    // die üblichen 30 Sekunden je Abfrage.
    await client.query("set statement_timeout = '5min'");
    await client.query("select pg_advisory_lock($1::bigint)", [lockKey]);
    try {
      const before = await count(client);
      // Erst hier laden: Fehler in der Konfiguration enden im catch von instrumentation-node.ts.
      const { default: config } = await import("@payload-config");
      const payload = await getPayload({ config });
      const after = await count(client);
      console.log(`migrate: ${after - before} neue Migration(en) eingespielt, ${after} insgesamt (${Date.now() - started} ms)`);
      await backfillOnce(payload);
      await seedOnce(payload);
      await logSetupCode(payload);
    } finally {
      await client.query("select pg_advisory_unlock($1::bigint)", [lockKey]);
    }
  } finally {
    await client.end();
  }
}

// backfillOnce legt für Seiten aus der Zeit vor den Entwürfen eine
// veröffentlichte Version an (lib/page-versions.ts). Scheitert das, startet die
// Website trotzdem (öffentlich unverändert); der nächste Start versucht es erneut.
export async function backfillOnce(payload: Payload): Promise<void> {
  try {
    const n = await backfillPageVersions(payload);
    if (n > 0) console.log(`migrate: ${n} Seite(n) als veröffentlichte Version übernommen (Entwürfe und Vorschau)`);
  } catch (err) {
    console.error(`migrate: Versionen für bestehende Seiten fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// seedOnce legt beim ersten Start die Beispielinhalte an (lib/seed.ts), nur
// solange es weder ein Konto noch eine Seite gibt. Scheitert das, startet die
// Website trotzdem, nur ohne Beispiele.
export async function seedOnce(payload: Payload): Promise<void> {
  try {
    if (!(await shouldSeed(payload))) return;
    const pages = await seedDemo(payload);
    console.log(`seed: Beispielinhalte angelegt (${pages} Seiten, Musterfirma GmbH); im Admin-Panel änderbar`);
  } catch (err) {
    console.error(`seed: fehlgeschlagen, die Website startet ohne Beispielinhalte: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// logSetupCode schreibt den Einrichtungscode ins Log, solange es kein Konto
// gibt (sonst nichts). Das Log sieht nur das Team des Projekts.
export async function logSetupCode(payload: Payload): Promise<void> {
  const { totalDocs } = await payload.count({ collection: "users", overrideAccess: true });
  if (totalDocs === 0) {
    console.log(
      `start: Einrichtungscode für das erste Konto: ${setupCode(payloadSecret())} (unter /admin eintragen; gilt, bis das erste Konto angelegt ist)`,
    );
  }
}

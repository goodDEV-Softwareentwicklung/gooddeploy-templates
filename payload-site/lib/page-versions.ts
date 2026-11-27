// Seiten aus der Zeit vor den Entwürfen (bis alpha.17) haben keine Version.
// Payload liest im Admin-Panel und in der Live-Vorschau (draft: true) aber aus
// der Versionstabelle: Ohne Version wäre die Seitenliste leer und die Vorschau
// zeigte 404, bis jemand die Seite einmal speichert. backfillPageVersions legt
// für jede Seite ohne Version eine veröffentlichte Version an, mit denselben
// Inhalten, jede Seite für sich.
//
// Warum hier und nicht in der Migration: Die Local API arbeitet mit dem
// aktuellen Schema. In einer Migration liefe sie später auch gegen eine
// Datenbank, der Spalten aus jüngeren Migrationen noch fehlen. Hier läuft sie
// nach allen Migrationen, unter derselben Sperre (lib/migrate-on-start.ts),
// und nur für Seiten ohne Version: ein zweiter Start findet nichts mehr.
import type { Payload } from "payload";

type Stamp = { id: number; updatedAt: string };

/** Seiten ohne jede Version */
export async function pagesWithoutVersion(payload: Payload): Promise<Stamp[]> {
  const { docs } = await payload.find({ collection: "pages", depth: 0, pagination: false, overrideAccess: true });
  const missing: Stamp[] = [];
  for (const doc of docs) {
    const { totalDocs } = await payload.countVersions({ collection: "pages", where: { parent: { equals: doc.id } }, overrideAccess: true });
    if (totalDocs === 0) missing.push({ id: doc.id, updatedAt: doc.updatedAt });
  }
  return missing;
}

/** SQL: „Zuletzt geändert“ der Seite wiederherstellen */
export const restorePageStamp = "UPDATE pages SET updated_at = $2 WHERE id = $1";

/** SQL: nur die eben angelegte Version (die neueste, latest) bekommt den alten Zeitpunkt */
export const restoreVersionStamp =
  "UPDATE _pages_v SET updated_at = $2, created_at = $2, version_updated_at = $2 WHERE parent_id = $1 AND latest";

/**
 * Legt die fehlenden Versionen an, je Seite einzeln: Scheitert eine Seite (z. B.
 * ein später dazugekommenes Pflichtfeld fehlt), bekommen die anderen trotzdem
 * ihre Version; die gescheiterte steht mit ID im Log und kommt beim nächsten
 * Start wieder dran. Gibt die Zahl der angelegten Versionen zurück.
 */
export async function backfillPageVersions(payload: Payload, log: (line: string) => void = console.error): Promise<number> {
  const missing = await pagesWithoutVersion(payload);
  let created = 0;
  for (const { id, updatedAt } of missing) {
    try {
      // Nur der Status: Payload übernimmt alle übrigen Felder aus der Seite und speichert sie als Version
      // (in einer eigenen Transaktion je Aufruf).
      await payload.update({ collection: "pages", id, data: { _status: "published" }, draft: false, overrideAccess: true });
      // Payload setzt beim Speichern „Zuletzt geändert“ neu; den alten Zeitpunkt wiederherstellen.
      await payload.db.pool.query(restorePageStamp, [id, updatedAt]);
      await payload.db.pool.query(restoreVersionStamp, [id, updatedAt]);
      created++;
    } catch (err) {
      log(`migrate: Seite ${id} hat noch keine Version (nächster Start versucht es erneut): ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return created;
}

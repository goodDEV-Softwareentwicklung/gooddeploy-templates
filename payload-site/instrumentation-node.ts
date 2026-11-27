// Beim Start in Produktion (gooddeploy) erst die Migrationen, dann Anfragen.
// Schlägt das fehl, endet der Prozess: Die neue Version wird nicht gesund,
// bei promote bleibt die bisherige Version live.
import { getPayload } from "payload";
import { backfillOnce, logSetupCode, migrateOnStart, seedOnce } from "./lib/migrate-on-start.ts";

if (process.env.NODE_ENV === "production") {
  try {
    await migrateOnStart();
  } catch (err) {
    console.error("migrate: fehlgeschlagen:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
} else {
  // Lokal (npm run dev): Beispielinhalte beim ersten Start (wie README,
  // „Lokal starten“) und den Einrichtungscode zeigen, falls die Datenbank
  // schon migriert ist und noch kein Konto hat. Lokal startet nur eine
  // Instanz, darum ohne Sperre.
  try {
    const { default: config } = await import("@payload-config");
    const payload = await getPayload({ config });
    await backfillOnce(payload);
    await seedOnce(payload);
    await logSetupCode(payload);
  } catch {
    // Datenbank fehlt oder ist nicht migriert: README, „Lokal starten“.
  }
}

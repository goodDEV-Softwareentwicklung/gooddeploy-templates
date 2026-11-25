// Start auf gooddeploy: erst die Datenbank-Migrationen, dann Next.js.
//
// gooddeploy startet Next.js-Apps mit `node server.js` (nicht mit npm start).
// Darum steht in next.config.ts kein `output: "standalone"`: Nur so nimmt
// gooddeploy das ganze Projekt samt node_modules und startet diese Datei
// (der Hinweis zu "standalone" beim Deploy ist hier erwartet).
// Handbuch: https://docs.gooddeploy.eu/datenbank-in-der-app.html#migrationen-ausrollen
const { execFileSync } = require("node:child_process");

if (!process.env.BETTER_AUTH_SECRET) {
  console.error(
    "start: BETTER_AUTH_SECRET fehlt. Setz ihn mit `gooddeploy env add BETTER_AUTH_SECRET` (Wert z. B. aus `openssl rand -base64 32`) und deploye neu.",
  );
  process.exit(1);
}

// Schlägt eine Migration fehl, endet der Start hier: Die neue Version wird
// nicht gesund, bei promote bleibt die bisherige Version live.
execFileSync(process.execPath, ["scripts/migrate.mjs"], { stdio: "inherit" });

process.env.NEXT_DEPLOYMENT_ID ||= process.env.GOODDEPLOY_DEPLOYMENT_ID || "";
process.argv.splice(2, 0, "start");
require("next/dist/bin/next");

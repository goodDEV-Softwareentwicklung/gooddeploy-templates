# Arbeiten in dieser Website (für Coding-Assistenten)

Diese Website ist eine Startvorlage von gooddeploy: eine Unternehmens-Website aus Modulen, Next.js
(App Router) mit [Payload 3](https://payloadcms.com/docs) als CMS im selben Prozess, Postgres über
den Payload-Adapter.
Sie läuft auf gooddeploy, einer Plattform für Deploys in Deutschland. Halte dich an diese Datei;
rate keine Befehle. Das Handbuch steht unter https://docs.gooddeploy.eu/.

## Leitplanken

- `gooddeploy promote`, `gooddeploy rollback`, Löschen (`gooddeploy rm`, `gooddeploy projects rm`)
  und Änderungen an Rechten nur nach ausdrücklicher Rückfrage.
- Schreibe oder zeige nie Passwörter, Tokens, Verbindungsadressen oder Werte von
  Umgebungsvariablen, auch nicht aus `.env*`-Dateien. Lies `.env.development.local` nicht.
- `gooddeploy env add` fragt den Wert verdeckt im Terminal ab, `gooddeploy login` die E-Mail mit
  Bestätigung per Link. Nenne der Nutzerin den fertigen Befehl; sie führt ihn selbst aus. Gib
  Werte nie als Argument an.
- Migrationen gegen die Live-Datenbank und `gooddeploy db dump` nur nach Rückfrage.

## Aufbau

| Pfad | Zweck |
|---|---|
| `payload.config.ts` | Payload: Sammlungen, Global, Postgres, S3-Adapter für Uploads, Migrationen beim Start |
| `collections/Pages.ts` | Seiten (Titel, Adresse, Beschreibung, Module) mit Entwürfen; Adresse `home` ist die Startseite |
| `lib/preview.ts`, `app/(site)/live-preview.tsx` | Live-Vorschau im Admin-Panel (`?preview=1`, Entwurf nur mit Anmeldung) |
| `collections/ReusableBlocks.ts`, `People.ts` | Modul-Bibliothek; Personen für Team und Kontakt |
| `collections/Redirects.ts`, `lib/redirects.ts` | Weiterleitungen (Plugin `@payloadcms/plugin-redirects`), angewendet in `app/(site)/not-found-or-redirect.ts` |
| `fields/seo.ts`, `lib/metadata.ts` | SEO-Felder der Seiten (Plugin `@payloadcms/plugin-seo`) und die Meta-Tags daraus |
| `collections/Media.ts` | Bilder; nur mit S3-Speicher, sonst ist das Hochladen aus |
| `lib/sample-images.ts`, `public/samples/` | Beispielbilder der Musterfirma (ohne S3, Unsplash License, nicht MIT; `CREDITS.md`) |
| `collections/Users.ts` | Konten für das Admin-Panel (erstes Konto nur mit Einrichtungscode) |
| `globals/SiteSettings.ts` | Global „Website“: Name, Logo, Menü, Fuß, Theme und Farben |
| `components/admin/` | eigene Felder im Admin-Panel (Farbwähler); nach Änderungen `npm run generate:importmap` |
| `lib/favicon.ts`, `app/site-icon/` | Favicon aus Logo, sonst Icon in der Theme-Farbe (`/site-icon`) |
| `components/admin/AdminGraphics.tsx`, `lib/admin-graphics.ts` | Logo bzw. Icon der Website im Kopf und auf der Anmeldeseite des Admin-Panels |
| `plugins/siteMcp/` | Website per Claude pflegen: `/api/mcp` (`@payloadcms/plugin-mcp`), MCP-Schlüssel, Werkzeuge (`tools.ts`), Upload-Link für Bilder |
| `components/admin/McpGuide.tsx`, `lib/mcp-guide.ts` | Anleitung auf der Seite der MCP-Schlüssel (Claude Desktop, Claude Code, andere Agents) |
| `blocks/` | Module: je Ordner `config.ts` (Felder) und `Component.tsx`; `registry.ts` (wo erlaubt), `components.ts` (blockType → Komponente), `mappers.ts` (Payload-Daten → ui) |
| `ui/` | Darstellung ohne Payload: React-Komponenten mit CSS-Modulen |
| `themes/` | Themes (Farben, Schriften, Tokens), `resolve.ts` schreibt sie als CSS-Variablen, hell und dunkel |
| `fonts/` | Schriften lokal mit Lizenzen (SIL OFL) |
| `fields/` | gemeinsame Felder (Link, Überschrift, Fließtext) |
| `lib/seed.ts` | Beispielinhalte der Musterfirma GmbH beim ersten Start |
| `migrations/` | Migrationen (erzeugt mit `npm run migrate:create`, committen); `index.ts` listet sie |
| `lib/env.ts` | alle Umgebungsvariablen an einer Stelle (Geheimnis, Datenbank, S3) |
| `lib/migrate-on-start.ts`, `instrumentation*.ts` | spielt beim Start die Migrationen ein, genau einmal (Sperre), danach die Beispielinhalte |
| `lib/content.ts` | Seiten und Global aus dem CMS lesen (Local API; veröffentlicht, Entwurf nur in der Vorschau) |
| `app/(site)/` | die Website: Layout mit Kopf und Fuß (`chrome.tsx`), Startseite, `[slug]` für alle anderen Seiten, `globals.css` |
| `app/(payload)/` | Admin-Panel und REST-API von Payload (erzeugt, nicht von Hand ändern) |
| `app/api/health/` | Health-Check mit Datenbank-Prüfung (`gooddeploy.json`) |

## Regeln für Code in dieser Website

- **Uploads nur Bilder, nur in S3.** Erlaubt sind `imageMimeTypes` (kein SVG) bis `maxUploadBytes`
  (10 MB) aus `collections/Media.ts`.
- **Speicherort:** `collections/Media.ts` setzt `disableLocalStorage: true`; ohne `S3_*`
  ist das Hochladen aus. Nie Dateien ins Dateisystem schreiben (kein `staticDir`, kein `fs` für
  Uploads): Es ist nicht dauerhaft und je Instanz verschieden. Diese Sperre nicht als Fehler
  „beheben“.
- **Schema nur über Migrationen.** `push` ist aus. Nach jeder Änderung an `collections/` oder
  `payload.config.ts`: `npm run migrate:create <name>` gegen die lokale Datenbank, die neuen
  Dateien in `migrations/` committen, `npm run generate:types`. Migrationen nie von Hand ändern,
  wenn sie schon deployt sind.
- Migrationen **erst erweitern, dann aufräumen**: Alle Previews teilen sich eine Datenbank, und
  bei `promote` läuft die Migration, während die alte Version noch live ist. Neue Felder optional
  oder mit Standardwert; Felder löschen oder umbenennen erst in einem späteren Deploy.
- Seiten mit Inhalten aus dem CMS sind dynamisch (`export const dynamic = "force-dynamic"` im
  Layout von `app/(site)`): Beim Build gibt es keine Datenbank.
- Inhalte serverseitig über die Local API lesen (`getPayload({ config })`, siehe `lib/content.ts`),
  nicht per `fetch` an die eigene `/api`. Die Local API übergeht Zugriffsrechte, wenn man sie
  nicht abschaltet: auf der Website `overrideAccess: false` und nur `_status: "published"`;
  Entwürfe (`draft: true`) nur in der Vorschau mit angemeldetem Konto (`findPage`).
- **Entwürfe:** Seiten speichern beim Tippen einen Entwurf; live erst mit „Veröffentlichen“. Neue
  Sammlungen mit öffentlichen Inhalten bekommen dieselbe Regel (`versions.drafts`, Lesen ohne
  Konto nur `published`). Entwürfe nie ohne Anmeldung zeigen, auch nicht über `?preview=1`.
- **Module:** keine Module mit freiem HTML, Skripten oder Einbettungen fremder Seiten (XSS: Website
  und Admin-Panel teilen sich die Adresse). Ein Formular mit Versand braucht Spamschutz und eine
  Rechtsgrundlage; frag vorher nach. Payload-Daten nur in `blocks/` kennen, `ui/` bleibt neutral.
- **Farben nur über Tokens** (`var(--primary)` usw., Liste in `themes/contract.ts`), nicht fest im
  CSS: sonst passen Themes und der dunkle Modus nicht. Neue Paletten erfüllen WCAG AA
  (`tests/themes.test.ts`).
- Beispielinhalte (`lib/seed.ts`) nur ändern, wenn die Nutzerin das will; sie laufen nur ohne Konto
  und ohne Seite. Keine echten Firmen, Personen oder Kontaktdaten als Beispiel. Neue
  Beispielbilder nur mit freier Lizenz, ohne erkennbare Personen, Logos und Marken, mit Eintrag
  in `public/samples/CREDITS.md`.
- **MCP (`plugins/siteMcp/`):** Werkzeuge arbeiten immer mit `overrideAccess: false` und dem Konto
  des MCP-Schlüssels; Seiten nur als Entwurf (`draft: true`). Veröffentlichen, Offline-Nehmen und das
  Ändern des Globals „Website“ bleiben je Schlüssel standardmäßig aus (`optInTools`, Freigaben in
  `apiKeys.ts`). Gib über MCP keine Konten, Schlüssel oder Personen frei und schreibe nie Inhalte aus
  der Datenbank in die Anweisungen an den Client (`mcpInstructions`, eingeschleuste Anweisungen).
  Schlüssel werden nur gehasht gespeichert (`dropPlainKey`), nie im Klartext ausgeben oder loggen.
  Ein neues Werkzeug braucht einen Eintrag in `toolCatalog` und eine Migration (Spalte für die
  Freigabe). Den Server nicht beim Start importieren (Lazy-Load in `index.ts`).
- Zugriffsrechte stehen je Sammlung unter `access`. Lesen ist öffentlich, Schreiben nur mit
  Konto; neue Sammlungen bekommen ausdrücklich eigene Regeln.
- Schriften nicht mit `next/font/google` laden (Abruf aus dem Netz beim Build kann scheitern);
  eigene Schriften mit `next/font/local` aus dem Repo.
- `output: "standalone"` in `next.config.ts` bleibt; die Migrationen laufen über
  `instrumentation.ts`, nicht über eine eigene `server.js`.
- Neue Abhängigkeiten mit exakter Version (`npm install --save-exact`), `package-lock.json`
  committen. Alle `payload`- und `@payloadcms/*`-Pakete immer auf dieselbe Version heben.

## Ablauf auf gooddeploy

Eine neue Website aus dieser Vorlage entsteht am einfachsten mit einem Befehl (die Nutzerin im Terminal):

```sh
gooddeploy login
gooddeploy init payload-site meine-website          # Ordner, Git-Repo, Projekt mit Postgres, PAYLOAD_SECRET
cd meine-website
```

**Erstes Konto: Preview öffnen → `/admin`; den Einrichtungscode zeigt `gooddeploy logs <deployment>`.**
Einen Standard-Login oder Test-Nutzer gibt es nicht und soll es nicht geben; lege keinen an. Sag
der Nutzerin nach dem ersten Deploy, dass sie unter `/admin` der Preview ihr erstes Konto anlegt
und den Einrichtungscode mit `gooddeploy logs <deployment>` holt (Zeile
`start: Einrichtungscode für das erste Konto: …`). Den Code liest sie selbst; gib ihn nicht im
Chat aus. Die Prüfung in `collections/Users.ts` (`requireSetupCode`) nicht entfernen oder
abschwächen: Ohne sie kann jeder, der `/admin` zuerst aufruft, das Admin-Konto anlegen.

Ist die Website so entstanden, ist alles eingerichtet; weiter mit `gooddeploy deploy`. Prüfen
lässt sich das mit `gooddeploy status` und `gooddeploy db info`. Wurde die Vorlage anders geholt
(Archiv, GitHub), vor dem ersten Deploy:

```sh
gooddeploy login
git init && git add -A && git commit -m "Start"     # deploy lädt nur committete Dateien
gooddeploy link meine-website --postgres            # Projekt mit Postgres (Live und Previews)
gooddeploy env add PAYLOAD_SECRET --both            # Wert verdeckt, z. B. aus: openssl rand -base64 32
```

Dann:

```sh
gooddeploy deploy               # baut eine Preview, zeigt Adresse und Freigabelink
gooddeploy logs <id>            # Ausgabe der Version, u. a. „migrate: … neue Migration(en)“
gooddeploy promote <id>         # nach Rückfrage: Preview live schalten
gooddeploy status               # was live ist
gooddeploy db info              # Größe und Verbindungen der Datenbank
gooddeploy env ls               # gesetzte Variablen (Werte maskiert)
```

- Previews sind geschützt; einen Link zum Ansehen gibt `gooddeploy share <id>`.
- Eine geänderte Variable wirkt erst mit dem nächsten Deployment. Für Live:
  `gooddeploy redeploy`, dann `gooddeploy promote <id>`.
- Die Plattform setzt `DATABASE_URL` (Pool) und `DATABASE_URL_UNPOOLED` (direkt, für die Sperre
  beim Migrieren) selbst, dazu `GOODDEPLOY_URL` (Adresse der Version). Nicht selbst setzen.

## Variablen

| Variable | Pflicht | Wofür |
|---|---|---|
| `PAYLOAD_SECRET` | ja | Schlüssel für Sitzungen und Tokens; ohne ihn startet die Website nicht |
| `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | nein | schalten das Hochladen von Bildern ein |
| `S3_ENDPOINT`, `S3_REGION` | nein | Adresse und Region des S3-Anbieters (bei AWS nur die Region) |
| `S3_FORCE_PATH_STYLE` | nein | `false`, wenn der Anbieter keine Pfad-Adressen kann (Standard mit `S3_ENDPOINT`: `true`) |
| `SITE_MCP` | nein | `false` schaltet `/api/mcp` (Website per Claude pflegen, MCP-Schlüssel im Admin-Panel) ab |

Ohne S3-Variablen läuft die Website vollständig, nur ohne Hochladen; das Admin-Panel sagt das.
Einen eigenen Speicher für Dateien gibt es bei gooddeploy (noch) nicht; nimm den S3-Zugang eines
Anbieters.

## Häufige Fehler

| Was du siehst | Ursache | Lösung |
|---|---|---|
| „Einrichtungscode fehlt oder ist falsch“ beim ersten Konto | Code nicht oder falsch eingetragen | Code aus `gooddeploy logs <deployment>` der Version holen, deren Adresse du offen hast (Live und Previews haben je ihr eigenes erstes Konto) |
| Version startet nicht, Log: `PAYLOAD_SECRET fehlt` | Variable nicht gesetzt | `gooddeploy env add PAYLOAD_SECRET --both`, dann neu deployen |
| Log: `migrate: fehlgeschlagen: DATABASE_URL fehlt` | Projekt ohne Datenbank | `gooddeploy db create`, dann neu deployen |
| Log: `migrate: fehlgeschlagen: …` | Migration passt nicht zur Datenbank | Migration korrigieren; die bisherige Version bleibt live |
| „Hochladen ist aus, weil kein S3-Speicher eingerichtet ist“ | `S3_*` fehlen | S3-Variablen setzen (README, „Bilder hochladen“), neu deployen |
| Log beim Start: `S3 nur teilweise eingerichtet` | eine Pflicht-Variable fehlt | die genannte Variable setzen, neu deployen |
| Build bricht mit fehlender Datenbank ab | Seite fragt beim Build die Datenbank ab | Seite dynamisch machen (siehe Regeln) |
| Feld fehlt in der Datenbank (`column … does not exist`) | Migration vergessen | `npm run migrate:create <name>`, committen, deployen |
| `/api/health` meldet 503 | Datenbank nicht erreichbar | `gooddeploy logs <id>`, `gooddeploy db info` |
| `/api/mcp` antwortet 401 | Header `Authorization: Bearer <MCP-Schlüssel>` fehlt, Schlüssel gelöscht, oder Preview statt Live-Adresse | Nutzerin legt unter „MCP-Schlüssel“ einen neuen an; Live-Adresse nehmen |

## Handbuch

- Website mit CMS starten: https://docs.gooddeploy.eu/website-mit-cms.html
- Datenbank in der App: https://docs.gooddeploy.eu/datenbank-in-der-app.html
- Umgebungsvariablen: https://docs.gooddeploy.eu/umgebungsvariablen.html
- Deploy und Live: https://docs.gooddeploy.eu/deploy-und-live.html
- Logs, Checks, Datenbank: https://docs.gooddeploy.eu/logs-checks-datenbank.html
- Speichergröße: https://docs.gooddeploy.eu/speichergroesse.html
- Häufige Fehler: https://docs.gooddeploy.eu/haeufige-fehler.html

# Startvorlage: Website mit CMS (Next.js und Payload) für gooddeploy

Eine fertige Unternehmens-Website zum Weiterbauen: Seiten aus Modulen (Hero, Text, Kacheln,
Kennzahlen, Team, FAQ und mehr), die du im Admin-Panel unter `/admin` zusammenstellst. Next.js zeigt die Seiten, [Payload](https://payloadcms.com/)
verwaltet die Inhalte im selben Prozess, alles liegt in deiner eigenen Postgres-Datenbank. Sie
läuft auf [gooddeploy](https://gooddeploy.eu) ohne Umbau.

- Next.js 16 (App Router), React 19, TypeScript
- Payload 3 mit Postgres-Adapter, Admin-Panel auf Deutsch, Sammlungen `pages`, `reusable-blocks`,
  `people`, `media` und `users`, Global „Website“ für Name, Logo, Menü, Fuß und Gestaltung
- 13 Module: Abschnitt mit Spalten, Hero, Text, Bild + Text, Kacheln, Akkordeon/FAQ, Kennzahlen,
  Zitat, Call-to-Action, Galerie, Team, Kontakt (Infos ohne Formular) und Module aus einer Bibliothek
- Entwürfe und Live-Vorschau: Änderungen an Seiten sind erst nach „Veröffentlichen“ live; beim
  Bearbeiten steht die Seite gleich daneben (Desktop, Tablet, Mobil) und aktualisiert sich beim Tippen
- SEO-Felder je Seite (Titel, Beschreibung, Vorschaubild; Plugin `@payloadcms/plugin-seo`) und
  Weiterleitungen alter Adressen (Sammlung `redirects`, Plugin `@payloadcms/plugin-redirects`)
- Drei Themes (Neutral, Klassisch, Kraftvoll) mit Farbvarianten und eigenen Farben (Farbwähler mit
  Kontrastprüfung), umschaltbar im Admin-Panel ohne Build; hell und dunkel nach Systemeinstellung, mobil
- Favicon und Logo im Admin-Panel aus deinem Logo, sonst aus dem gewählten Icon in der Farbe des Themes
- Website per Claude pflegen: Claude oder ein anderer KI-Assistent legt über MCP (`/api/mcp`) Seiten
  als Entwurf an, mit einem MCP-Schlüssel je Konto; veröffentlicht wird nur mit Freigabe
- Beim ersten Start eine Beispielseite der fiktiven Musterfirma GmbH mit Unterseiten, Menü, Fuß
  und fünf Beispielbildern, damit gleich etwas zu sehen ist; die Bilder liegen in der Vorlage,
  sie sieht also auch ohne S3 fertig aus
- Bilder in einem S3-Speicher deiner Wahl; ohne S3-Zugang ist das Hochladen aus

Arbeitest du mit Claude Code, Cursor oder Copilot: Die Regeln für den Assistenten stehen in
`AGENTS.md` (Claude Code liest sie über `CLAUDE.md`). Sag einfach, was die Website können soll.

Handbuch: [Website mit CMS starten](https://docs.gooddeploy.eu/website-mit-cms.html).

## Loslegen

**Erstes Konto: Preview öffnen → `/admin`; den Einrichtungscode zeigt `gooddeploy logs <deployment>`.**
Einen Standard-Login gibt es nicht; das erste Konto legst du beim ersten Aufruf von `/admin`
selbst an. Damit das nicht ein Fremder vor dir tut, fragt das Formular nach einem
**Einrichtungscode**: Solange es kein Konto gibt, schreibt die Website ihn beim Start ins Log
(`start: Einrichtungscode für das erste Konto: …`). Er hängt an `PAYLOAD_SECRET` und wird
nach dem ersten Konto nicht mehr gebraucht. Hast du die Website noch nicht auf gooddeploy, geht das mit:

```sh
gooddeploy login
gooddeploy init payload-site meine-website --deploy   # Ordner, Projekt mit Postgres, PAYLOAD_SECRET, erste Preview
```

Bilder hochladen geht erst mit einem S3-Speicher (siehe „Bilder hochladen“ unten).

## Entwürfe und Vorschau

Seiten haben **Entwürfe**: Was du beim Bearbeiten änderst, speichert das Admin-Panel beim Tippen
als Entwurf (oder mit „Entwurf speichern“). Live geht es erst mit **„Änderungen veröffentlichen“**.
Ohne Anmeldung zeigen Website und API nur veröffentlichte Stände; eine neue Seite ist erst nach dem
Veröffentlichen erreichbar. Frühere Stände findest du unter „Versionen“ (bis zu 50 je Seite).

Beim Bearbeiten einer Seite steht rechts die **Live-Vorschau**: die Seite mit deinem Entwurf, die
sich beim Tippen aktualisiert, umschaltbar zwischen Desktop, Tablet und Mobil. Sie ist beim ersten
Öffnen offen; das Augen-Symbol neben „Entwurf speichern“ blendet sie aus und ein, Payload merkt sich
das je Konto. Den Entwurf sieht nur, wer angemeldet ist (Adresse mit `?preview=1`); Links zum
Teilen von Entwürfen gibt es noch nicht. Das Global „Website“ (Menü, Fuß, Gestaltung) hat keine
Entwürfe: „Speichern“ wirkt dort sofort.

## Website per Claude pflegen (MCP)

Unter „Verwaltung“ → „MCP-Schlüssel“ legst du einen Schlüssel an („Neuen API-Schlüssel
generieren“). Die Anleitung auf der Seite zeigt die Adresse `https://<deine-domain>/api/mcp` und
fertige Einträge für Claude Desktop (Connector oder `claude_desktop_config.json` mit `mcp-remote`),
Claude Code (`claude mcp add --transport http …`) und andere Agents; direkt nach dem Erzeugen steht
der Schlüssel schon darin. Danach ist er nicht mehr sichtbar, gespeichert ist nur ein Prüfwert.

- Ein Schlüssel hat höchstens die Rechte deines Kontos. Seiten legt der Assistent nur als Entwurf
  an (Markdown für Fließtext); veröffentlichen und offline nehmen darf er erst, wenn du
  `publish_page` bzw. `unpublish_page` beim Schlüssel ankreuzt, ebenso das Ändern der Einstellungen
  unter „Website“ (wirkt sofort).
- Bilder übernimmt er nur mit S3, mit denselben Grenzen wie beim Hochladen. Konten, Schlüssel und
  Personen gibt es über MCP nicht.
- Widerrufen: Schlüssel löschen. Abschalten: `SITE_MCP=false` setzen und neu deployen.
- Nimm die Live-Adresse: Previews sind geschützt, mit Passwortschutz geht MCP nicht.

Der MCP-Server (`@payloadcms/plugin-mcp`) wird erst beim ersten Aufruf von `/api/mcp` geladen und
kostet bis dahin keinen Speicher. Code: `plugins/siteMcp/`, Anleitung im Admin-Panel:
`components/admin/McpGuide.tsx` und `lib/mcp-guide.ts`.

## Bilder hochladen

**Ohne `S3_*` ist das Hochladen aus; das Admin-Panel sagt das bei „Bilder“.** Grund: Das
Dateisystem einer Version ist nicht dauerhaft, jede neue Version beginnt leer, und mehrere
Instanzen sehen nicht dieselben Dateien. Die Vorlage schreibt darum nie Dateien auf die Platte.

Einen eingebauten Speicher für Dateien gibt es bei gooddeploy (noch) nicht. Nimm einen
S3-kompatiblen Speicher eines Anbieters deiner Wahl (z. B. AWS oder ein europäischer Cloud-Anbieter) und setz die Zugangsdaten:

```sh
gooddeploy env add S3_ENDPOINT --both             # Adresse des Anbieters (bei AWS weglassen)
gooddeploy env add S3_REGION --both               # z. B. eu-central
gooddeploy env add S3_BUCKET --both
gooddeploy env add S3_ACCESS_KEY_ID --both
gooddeploy env add S3_SECRET_ACCESS_KEY --both
gooddeploy deploy
```

Danach erscheint unter „Bilder“ der Knopf zum Hochladen, und Module wie Hero, Bild + Text und
Galerie bekommen Bilder. Erlaubt
sind JPEG, PNG, WebP, GIF und AVIF (kein SVG) bis 10 MB je Datei (`maxUploadBytes` in
`collections/Media.ts`). Payload
liefert die Bilder unter `/api/media/file/…` aus; der Bucket muss nicht öffentlich sein. Willst du
Previews und Live trennen, nimm zwei Buckets und setz `S3_BUCKET` getrennt mit `--preview` und
`--production`. Ist S3 nur teilweise eingerichtet, nennt das Log beim Start die fehlende Variable.

## Lokal starten

Du brauchst Node.js 22.23.5 oder neuer (bzw. 24.22.3 oder neuer) und Docker.

```sh
npm install
docker run -d --name site-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=site postgres:17
cp .env.example .env.development.local
npm run migrate        # Tabellen anlegen
npm run dev            # http://localhost:3000, Admin-Panel unter http://localhost:3000/admin
```

Die Beispielinhalte der Musterfirma legt die Website beim ersten Start an. Auch lokal gibt es kein
fertiges Konto: Beim ersten Aufruf von `/admin` legst du es an; den Einrichtungscode zeigt
`npm run dev` im Terminal. Die Datei
`.env.development.local` bleibt auf deinem Rechner (`.gitignore`).

## Veröffentlichen mit gooddeploy

```sh
gooddeploy login
git init && git add -A && git commit -m "Start"
gooddeploy link meine-website --postgres
gooddeploy env add PAYLOAD_SECRET --both    # Wert verdeckt eingeben, z. B. aus: openssl rand -base64 32
gooddeploy deploy
```

`deploy` zeigt die Adresse der Preview und einen Freigabelink. Passt alles, schaltest du sie mit
`gooddeploy promote <id>` live. Beim Start jeder Version spielt die App neue Migrationen ein
(`instrumentation.ts`), genau einmal, auch wenn mehrere Instanzen gleichzeitig starten; im Log
steht dann `migrate: … neue Migration(en) eingespielt`.

**Beispielinhalte:** Beim allerersten Start (noch kein Konto, noch keine Seite) legt die Website
die Musterfirma GmbH an, unter derselben Sperre wie die Migrationen (Log:
`seed: Beispielinhalte angelegt …`). Ändere oder lösche sie im Admin-Panel; sobald es ein Konto
gibt, kommen sie nie wieder. Live hat eine eigene Datenbank und bekommt beim ersten Start dort
ebenfalls die Beispiele.

## Weiterbauen

- **Feld oder Sammlung ändern:** Datei in `collections/` bearbeiten, dann
  `npm run migrate:create <name>` (gegen deine lokale Datenbank), die neue Datei in `migrations/`
  committen, `npm run generate:types`, deployen.
- **Name, Logo, Menü, Fuß, Theme und Farben:** im Admin-Panel unter „Website“, ohne Build. Die
  eigenen Farben wählst du unter „Gestaltung“ mit dem Farbwähler; er zeigt den Wert aus dem
  Theme und den Kontrast zur Gegenfarbe (WCAG AA). Das Favicon folgt dem Logo, ohne Logo dem
  Icon in der Primärfarbe (`lib/favicon.ts`, ausgeliefert unter `/site-icon`). Liefert dein
  S3-Speicher das Logo unter einer absoluten, fremden Adresse aus, fällt das Favicon aufs Icon zurück.
- **Beispielbilder ersetzen:** eigene Bilder unter „Bilder“ hochladen (mit S3), im Modul
  auswählen und die Beispielbilder unter „Bilder“ löschen. Sie liegen in `public/samples/`.
- **Neue Seite:** im Admin-Panel unter „Seiten“, Module mit „Modul hinzufügen“; die Adresse
  `home` ist die Startseite. Wiederkehrende Module (z. B. ein Aufruf zum Gespräch) pflegst du
  einmal in der „Modul-Bibliothek“.
- **Aussehen im Code:** Themes in `themes/` (Farben, Schriften, Tokens), Darstellung der Module
  in `ui/` (je Komponente ein CSS-Modul), Grundlagen in `app/(site)/globals.css`.
- **Alte Adressen umleiten:** im Admin-Panel unter „Weiterleitungen“ (z. B. `/team` → Seite
  „Über uns“); sie greifen nur, wenn unter dem alten Pfad keine Seite liegt.
- **Neues Modul:** `blocks/<name>/config.ts` (Felder) und `Component.tsx`, eintragen in
  `blocks/registry.ts` und `blocks/components.ts`, dann Migration wie oben.
- **Hinweis „Läuft auf gooddeploy“ entfernen:** die Zeile `<PoweredBy />` in
  `app/(site)/layout.tsx` löschen (den Import und `app/(site)/powered-by.tsx` gleich mit, wenn du magst).
- **Mails** (z. B. „Passwort vergessen“ im Admin-Panel): Ohne E-Mail-Adapter schreibt Payload
  Mails nur ins Log. Einen Adapter (z. B. `@payloadcms/email-nodemailer` mit SMTP) trägst du in
  `payload.config.ts` ein.

## Tests

```sh
npm test          # Uploads, S3, Einrichtungscode, Module, Themes, Beispielinhalte, Entwürfe, Favicon, MCP (Node-Testrunner)
npm run typecheck
```

## Herkunft, Pflege und Lizenz

Die Vorlage wird aus dem gooddeploy-Repo von goodDEV veröffentlicht, mit jeder Version von
gooddeploy: im öffentlichen Repo
[goodDEV-Softwareentwicklung/gooddeploy-templates](https://github.com/goodDEV-Softwareentwicklung/gooddeploy-templates)
(Ordner `payload-site`, Übersicht aller Vorlagen im README dort) und als Archiv unter
[dl.gooddeploy.eu/starter/](https://dl.gooddeploy.eu/starter/). Gepflegt wird sie im Rahmen der
gooddeploy-Releases, ohne Gewähr: Wir heben sie an, wenn sie mit der Plattform nicht mehr läuft
(jedes Release prüft sie) oder wenn eine Abhängigkeit eine hohe oder kritische Sicherheitslücke
hat. Deine eigene Website, die du aus der Vorlage baust, hältst du selbst aktuell.

Lizenz: MIT (siehe `LICENSE`). Du darfst die Vorlage frei nutzen, ändern und in Kundenprojekten
einsetzen. Fremde Teile mit eigener Lizenz: die Schriften in `fonts/` (SIL Open Font License 1.1,
Texte in `fonts/licenses/`, Herkunft in `fonts/README.md`), die Icons aus `lucide-react`
(ISC-Lizenz, npm-Paket) und die Beispielbilder in `public/samples/` (Fotos von Unsplash unter der
Unsplash License, **nicht unter MIT**; Fotografen und Links in `public/samples/CREDITS.md`). Vorschaubilder der Module (`public/blocks/`) und Beispieltexte sind
Teil der Vorlage (MIT); die Musterfirma GmbH und alle Personen darin sind erfunden.

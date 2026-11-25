# Startvorlage: Next.js mit Login und Datenbank für gooddeploy

Eine kleine, fertige App zum Weiterbauen: Registrieren, Anmelden und Abmelden mit E-Mail und
Passwort, eine geschützte Seite mit Daten je Nutzer, Postgres mit Migrationen. Sie läuft auf
[gooddeploy](https://gooddeploy.eu) ohne Umbau; Anmeldung und Daten liegen in deiner eigenen
Datenbank, nicht bei einem weiteren Dienst.

- Next.js 16 (App Router), React 19, TypeScript
- [Better Auth](https://www.better-auth.com/) für die Anmeldung, Sitzungen in Postgres
- [Drizzle](https://orm.drizzle.team/) für Tabellen und Migrationen, Treiber `postgres`
- Mail für Bestätigung und Passwort-Reset nur, wenn du SMTP-Zugangsdaten setzt

Arbeitest du mit Claude Code, Cursor oder Copilot: Die Regeln für den Assistenten stehen in
`AGENTS.md` (Claude Code liest sie über `CLAUDE.md`). Sag einfach, was die App können soll.

Handbuch: [Neue App mit Login starten](https://docs.gooddeploy.eu/app-mit-login.html).

## Lokal starten

Du brauchst Node.js 22.18 oder neuer und Docker.

```sh
npm install
docker run -d --name starter-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=starter postgres:17
cp .env.example .env.development.local
```

In `.env.development.local` trägst du bei `BETTER_AUTH_SECRET` einen zufälligen Wert ein,
z. B. die Ausgabe von `openssl rand -base64 32`. Die Datei bleibt auf deinem Rechner
(`.gitignore`). Dann:

```sh
npm run db:migrate     # Tabellen anlegen
npm run dev            # http://localhost:3000
```

## Veröffentlichen mit gooddeploy

```sh
gooddeploy login
git init && git add -A && git commit -m "Start"
gooddeploy link meine-app --postgres
gooddeploy env add BETTER_AUTH_SECRET --both    # Wert verdeckt eingeben
gooddeploy deploy
```

`deploy` zeigt die Adresse der Preview und einen Freigabelink. Passt alles, schaltest du sie
mit `gooddeploy promote <id>` live. Beim Start jeder Version spielt `server.js` neue
Migrationen ein, genau einmal, auch wenn mehrere Instanzen gleichzeitig starten. Der Hinweis
beim Deploy, dass `output: "standalone"` fehlt, ist hier gewollt: Nur ohne startet gooddeploy
die eigene `server.js`.

## Weiterbauen

- **Tabelle ändern:** `db/schema.ts` bearbeiten, `npm run db:generate`, die neue Datei in
  `drizzle/` committen, deployen.
- **Seite schützen:** `await requireSession()` aus `lib/session.ts` am Anfang der Seite.
- **Daten je Nutzer:** immer nach `session.user.id` filtern (Beispiel: `lib/notes.ts`).
- **Mail einschalten:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` (und meist `SMTP_USER`,
  `SMTP_PASSWORD`) mit `gooddeploy env add … --both` setzen und neu deployen. Dann bestätigen
  neue Konten ihre Adresse per Link, und „Passwort vergessen“ erscheint.
- **Eigene Domain:** die Domain in `BETTER_AUTH_ALLOWED_HOSTS` eintragen
  (`gooddeploy env add BETTER_AUTH_ALLOWED_HOSTS --production`), sonst lehnt die Anmeldung dort
  ab („Diese Adresse ist für die Anmeldung nicht freigegeben“).
- **Grenzen gegen Passwort-Raten:** je IP-Adresse (z. B. 5 Anmeldungen je Minute) und je
  E-Mail-Adresse (10 Fehlversuche in 15 Minuten; erfolgreiche Anmeldungen zählen nicht). Die
  Grenze je E-Mail-Adresse gilt auch für das richtige Passwort: Wer viele Fehlversuche gegen ein
  Konto schickt, auch von verschiedenen IP-Adressen, sperrt es für 15 Minuten. Das ist der Preis
  gegen verteiltes Raten; anpassen in `lib/auth-options.ts`.

Gut zu wissen: Ohne Mail-Versand sagt die Registrierung, wenn es eine Adresse schon gibt (anders
geht es ohne Bestätigungs-Mail nicht). Mit Mail antwortet sie für bekannte und neue Adressen gleich.

## Tests

```sh
npm test          # Anmeldung, Grenzen, Mail-Versand, erlaubte Adressen (Node-Testrunner)
npm run typecheck
```

## Herkunft, Pflege und Lizenz

Die Vorlage wird aus dem gooddeploy-Repo von goodDEV veröffentlicht, mit jeder Version von
gooddeploy: im öffentlichen Repo
[goodDEV-Softwareentwicklung/gooddeploy-templates](https://github.com/goodDEV-Softwareentwicklung/gooddeploy-templates)
(Ordner `nextjs-auth`, Übersicht aller Vorlagen im README dort) und als Archiv unter
[dl.gooddeploy.eu/starter/](https://dl.gooddeploy.eu/starter/). Änderungen fließen von dort
hierher. Gepflegt wird sie im Rahmen der gooddeploy-Releases, ohne Gewähr: Wir heben sie an,
wenn sie mit der Plattform nicht mehr läuft (jedes Release prüft sie) oder wenn eine Abhängigkeit
eine hohe oder kritische Sicherheitslücke hat. Deine eigene App, die du aus der Vorlage baust,
hältst du selbst aktuell.

Lizenz: MIT (siehe `LICENSE`). Du darfst die Vorlage frei nutzen, ändern und in Kundenprojekten
einsetzen.

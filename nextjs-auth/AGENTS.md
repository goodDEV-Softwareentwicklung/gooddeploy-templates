# Arbeiten in dieser App (für Coding-Assistenten)

Diese App ist die Startvorlage von gooddeploy: Next.js (App Router) mit Anmeldung über
[Better Auth](https://www.better-auth.com/) (E-Mail und Passwort) und Postgres über Drizzle.
Sie läuft auf gooddeploy, einer Plattform für Deploys in Deutschland. Halte dich an diese
Datei; rate keine Befehle. Das Handbuch steht unter https://docs.gooddeploy.eu/.

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
| `lib/auth-options.ts` | Better Auth: E-Mail und Passwort, erlaubte Adressen, Grenzen gegen Passwort-Raten und Mail-Fluten |
| `lib/auth.ts`, `lib/auth-client.ts` | Better Auth auf dem Server (mit Postgres) bzw. im Browser (Formulare) |
| `lib/mail.ts` | Mail-Versand (Bestätigung, Passwort-Reset), nur mit SMTP-Variablen |
| `lib/session.ts` | `requireSession()` für geschützte Seiten (leitet sonst auf `/login`) |
| `db/schema.ts` | Tabellen (Drizzle); `user`, `session`, `account`, `verification` gehören Better Auth |
| `drizzle/` | Migrationen (erzeugt, committen, nie von Hand ändern) |
| `scripts/migrate.mjs` | spielt Migrationen beim Start ein, genau einmal (Sperre) |
| `server.js` | Start auf gooddeploy: erst Migrationen, dann Next.js |
| `app/*/…-form.tsx` | Formulare: Registrieren, Anmelden, Passwort-Reset über `authClient` an `/api/auth/*` |
| `app/actions.ts` | Server Actions: Abmelden, Notizen |
| `app/dashboard/` | geschützte Beispielseite mit Notizen je Nutzer |
| `app/api/health/` | Health-Check mit Datenbank-Prüfung (`gooddeploy.json`) |

## Regeln für Code in dieser App

- Anmelden, Registrieren und Reset laufen im Browser über `authClient` (`lib/auth-client.ts`) an
  `/api/auth/*`. Nur dort prüft Better Auth die Herkunft und die Grenzen je IP-Adresse; ruf
  `auth.api.signInEmail` und Ähnliches nicht aus Server Actions auf.
- Die Grenzen gegen Passwort-Raten und Mail-Fluten (`lib/auth-options.ts`) sind gewollt. Nicht
  entfernen, abschwächen oder als Fehler „beheben“; Werte nur nach Rückfrage ändern. Nach
  10 Fehlversuchen je E-Mail-Adresse in 15 Minuten ist das Konto gesperrt, auch für das richtige
  Passwort (so kann ein Dritter ein Konto für 15 Minuten aussperren; das ist der Preis gegen
  verteiltes Raten). Erfolgreiche Anmeldungen zählen nicht.
- Geschützte Seiten und Server Actions rufen `requireSession()` auf und filtern Daten
  selbst nach `session.user.id` (`WHERE user_id = …`). Es gibt **kein Row Level Security**
  wie bei Supabase: Die Datenbank prüft nicht, wer fragt. Daten nie ohne diese Prüfung lesen
  oder schreiben.
- Funktionen, die Daten für einen Nutzer lesen, gehören nach `lib/` und nicht in eine Datei
  mit `"use server"`: Jede exportierte Funktion dort kann ein Browser mit beliebigen
  Argumenten aufrufen.
- Seiten mit Datenbank-Abfragen sind dynamisch (`export const dynamic = "force-dynamic"`
  oder `await connection()` aus `next/server`): Beim Build gibt es keine Datenbank.
- Abfragen über `db` aus `db/index.ts` (Pool, `max: 5`). Keine eigenen Verbindungen öffnen.
- Schema ändern: `db/schema.ts` bearbeiten, dann `npm run db:generate`, die neue Datei in
  `drizzle/` committen. Nie `drizzle-kit push` gegen gooddeploy.
- Migrationen **erst erweitern, dann aufräumen**: Alle Previews teilen sich eine Datenbank,
  und bei `promote` läuft die Migration, während die alte Version noch live ist. Neue Spalten
  mit Standardwert oder nullable; Spalten löschen oder umbenennen erst in einem späteren Deploy.
- `output: "standalone"` nicht in `next.config.ts` setzen, sonst startet gooddeploy
  `server.js` nicht und die Migrationen laufen nicht.
- Neue Abhängigkeiten mit exakter Version (`npm install --save-exact`), `package-lock.json`
  committen.

## Ablauf auf gooddeploy

Eine neue App aus dieser Vorlage entsteht am einfachsten mit einem Befehl (die Nutzerin im Terminal):

```sh
gooddeploy login
gooddeploy init nextjs-auth meine-app               # Ordner, Git-Repo, Projekt mit Postgres, BETTER_AUTH_SECRET
cd meine-app
```

Ist die App so entstanden, ist alles eingerichtet; weiter mit `gooddeploy deploy`. Prüfen lässt
sich das mit `gooddeploy status` und `gooddeploy db info`. Wurde die Vorlage anders geholt
(Archiv, GitHub), vor dem ersten Deploy:

```sh
gooddeploy login
git init && git add -A && git commit -m "Start"     # deploy lädt nur committete Dateien
gooddeploy link meine-app --postgres                # Projekt mit Postgres (Live und Previews)
gooddeploy env add BETTER_AUTH_SECRET --both        # Wert verdeckt, z. B. aus: openssl rand -base64 32
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
- Die Plattform setzt `DATABASE_URL` (Pool) und `DATABASE_URL_UNPOOLED` (direkt, für
  Migrationen) selbst, dazu `GOODDEPLOY_URL` (Adresse der Version). Nicht selbst setzen.

## Variablen

| Variable | Pflicht | Wofür |
|---|---|---|
| `BETTER_AUTH_SECRET` | ja | Schlüssel für Sitzungen; ohne ihn startet die App nicht |
| `BETTER_AUTH_ALLOWED_HOSTS` | nein | weitere Adressen der App, Komma-Liste, `*` als Platzhalter: eigene Domains (`app.example.de`) und Branch-Adressen (`meine-app-git-*.` und die Domain, unter der deine Previews liegen) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` | nein | schalten Bestätigungs-Mail und Passwort-Reset ein |
| `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE` | nein | Anmeldung beim Mail-Server, `SMTP_SECURE=true` für Port 465 |

Ohne SMTP-Variablen läuft die App vollständig, nur ohne Bestätigungs-Mail und ohne
„Passwort vergessen“; die Oberfläche sagt das. Einen eigenen Mail-Dienst gibt es bei gooddeploy (noch) nicht;
nimm den SMTP-Zugang eines Anbieters.

## Häufige Fehler

| Was du siehst | Ursache | Lösung |
|---|---|---|
| Hinweis beim Deploy, dass `output: "standalone"` fehlt | gewollt, siehe oben | nichts tun |
| Version startet nicht, Log: `start: BETTER_AUTH_SECRET fehlt` | Variable nicht gesetzt | `gooddeploy env add BETTER_AUTH_SECRET --both`, dann neu deployen |
| Log: `migrate: DATABASE_URL fehlt` | Projekt ohne Datenbank | `gooddeploy db create`, dann neu deployen |
| Log: `migrate: fehlgeschlagen: …` | Migration passt nicht zur Datenbank | Migration korrigieren; die bisherige Version bleibt live |
| Formular meldet „Diese Adresse ist für die Anmeldung nicht freigegeben“ (403, `INVALID_ORIGIN`) | Adresse ist nicht freigegeben (eigene Domain, Branch-Adresse) | Adresse in `BETTER_AUTH_ALLOWED_HOSTS` eintragen, neu deployen |
| „Zu viele Versuche“ (429) | Grenze gegen Passwort-Raten: 5 Anmeldungen je Minute und IP-Adresse oder 10 Fehlversuche je E-Mail-Adresse in 15 Minuten (sperrt dann auch das richtige Passwort) | warten; Werte in `lib/auth-options.ts`, nur nach Rückfrage |
| Build bricht mit fehlender `DATABASE_URL` ab | Seite fragt beim Build die Datenbank ab | Seite dynamisch machen (siehe Regeln) |
| Preview meldet unbekannte Spalten | andere Preview hat eine Migration eingespielt | Migrationen rückwärtsverträglich schreiben |
| `/api/health` meldet 503 | Datenbank nicht erreichbar | `gooddeploy logs <id>`, `gooddeploy db info` |

## Handbuch

- Neue App mit Login starten: https://docs.gooddeploy.eu/app-mit-login.html
- Datenbank in der App: https://docs.gooddeploy.eu/datenbank-in-der-app.html
- Umgebungsvariablen: https://docs.gooddeploy.eu/umgebungsvariablen.html
- Deploy und Live: https://docs.gooddeploy.eu/deploy-und-live.html
- Logs, Checks, Datenbank: https://docs.gooddeploy.eu/logs-checks-datenbank.html
- Häufige Fehler: https://docs.gooddeploy.eu/haeufige-fehler.html

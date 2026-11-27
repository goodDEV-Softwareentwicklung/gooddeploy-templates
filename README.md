# Vorlagen für gooddeploy

Fertige Startpunkte für Apps, die ohne Umbau auf [gooddeploy](https://gooddeploy.eu) laufen. Jede
Vorlage liegt in einem eigenen Ordner, bringt eine `AGENTS.md` für Coding-Assistenten (Claude Code,
Cursor, Copilot) mit und wird vor jeder Version von gooddeploy auf einer Testumgebung deployt und
geprüft.

| Vorlage | Wofür | Stack | Handbuch |
|---|---|---|---|
| [nextjs-auth](https://github.com/goodDEV-Softwareentwicklung/gooddeploy-templates/tree/main/nextjs-auth) | App mit Registrieren, Anmelden und eigener Postgres-Datenbank, ohne zusätzlichen Anmeldedienst | Next.js 16, React 19, TypeScript, Better Auth, Drizzle, Postgres | [Neue App mit Login starten](https://docs.gooddeploy.eu/app-mit-login.html) |
| [payload-site](https://github.com/goodDEV-Softwareentwicklung/gooddeploy-templates/tree/main/payload-site) | Unternehmens-Website mit CMS: Seiten aus Modulen im Admin-Panel zusammenstellen, drei Themes, Inhalte in eigener Postgres-Datenbank | Next.js 16, React 19, TypeScript, Payload 3, Postgres, S3 für Bilder (optional) | [Website mit CMS starten](https://docs.gooddeploy.eu/website-mit-cms.html) |

## Vorlage holen

Mit `create-next-app` (legt den Ordner an, installiert die Pakete und legt ein Git-Repo an):

```sh
npx create-next-app@latest meine-app --example https://github.com/goodDEV-Softwareentwicklung/gooddeploy-templates/tree/main/nextjs-auth
```

Oder nur die Dateien, mit `degit`:

```sh
npx degit goodDEV-Softwareentwicklung/gooddeploy-templates/nextjs-auth meine-app
cd meine-app
npm install
```

Für die Website mit CMS steht statt `nextjs-auth` jeweils `payload-site` am Ende. Eine bestimmte
Version holst du mit dem Tag, z. B. `…/nextjs-auth#v0.1.0-alpha.15` bei `degit`. Ohne GitHub gibt
es jede Vorlage auch als Archiv mit Prüfsumme unter
[dl.gooddeploy.eu/starter/](https://dl.gooddeploy.eu/starter/). Am kürzesten geht es mit
`gooddeploy init <vorlage> <ordner>`: Ordner, Git-Repo und Projekt mit Datenbank in einem Schritt.

Den Knopf „Use this template“ gibt es hier bewusst nicht: GitHub kopiert damit immer das ganze Repo
mit allen Vorlagen, nicht einen Ordner.

## Weiter

Wie es nach dem Holen weitergeht (lokal starten, Datenbank, `gooddeploy deploy`), steht im
`README.md` der jeweiligen Vorlage und im [Handbuch](https://docs.gooddeploy.eu/vorlagen.html).

## Hinweise

- Dieses Repo ist eine Kopie. Die Vorlagen werden bei goodDEV gepflegt und mit jeder Version von
  gooddeploy hierher übertragen (ein Commit „Stand aus gooddeploy vX.Y.Z“ und ein Tag je Version).
  Änderungen per Pull Request übernehmen wir darum nicht direkt.
- Lizenz: MIT, siehe [LICENSE](https://github.com/goodDEV-Softwareentwicklung/gooddeploy-templates/blob/main/LICENSE).

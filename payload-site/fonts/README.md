# Schriften

Lokal eingebunden über `next/font/local` (`index.ts`), damit der Build ohne Netz läuft und Besucher nichts von
Google laden.

- **Quelle:** npm-Pakete von [Fontsource](https://fontsource.org) 5.3.0 (`@fontsource-variable/<name>`, für Barlow
  Condensed `@fontsource/barlow-condensed`), daraus nur die Dateien `*-latin-*-normal.woff2`.
- **Lizenz:** alle SIL Open Font License 1.1, Text je Schrift in `licenses/`. Die Schriften dürfen mit der Website
  weitergegeben werden; die Lizenztexte bleiben dabei.
- **Neue Schrift:** WOFF2 (Teilmenge `latin`) nach `files/`, Lizenz nach `licenses/`, Eintrag in `index.ts` mit
  `variable: "--font-<kennung>"` und `preload: false`, dann in `themes/runtime.ts` dem Theme zuordnen.

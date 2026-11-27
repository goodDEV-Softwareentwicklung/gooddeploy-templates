"use client";
// Anleitung auf der Seite der MCP-Schlüssel (ST-14-14, Kriterium 3): Adresse
// des eigenen Endpunkts und Einträge zum Kopieren für Claude Desktop, Claude
// Code und andere Agents (lib/mcp-guide.ts). In der Liste ohne Schlüssel; beim
// Bearbeiten steht ein eben erzeugter Schlüssel in den Einträgen, bis
// gespeichert ist. Danach ist er nur noch gehasht gespeichert.
import { CopyToClipboard, useConfig, useFormFields } from "@payloadcms/ui";
import { useEffect, useState } from "react";
import { guideSnippets, keyPlaceholder, mcpEndpoint } from "../../lib/mcp-guide.ts";
import styles from "./McpGuide.module.css";

function Snippet({ value }: { value: string }) {
  return (
    <div className={styles.snippet}>
      <pre>{value}</pre>
      <span className={styles.copy}>
        <CopyToClipboard value={value} />
      </span>
    </div>
  );
}

function useEndpoint(): string {
  const { config } = useConfig();
  const apiRoute = config.routes?.api ?? "/api";
  // Adresse erst im Browser bestimmen (eigene Domain, Live oder lokal).
  const [origin, setOrigin] = useState(config.serverURL || "");
  useEffect(() => setOrigin(window.location.origin), []);
  return mcpEndpoint(origin || "https://<deine-website>", apiRoute);
}

export function McpGuideBox({ freshKey }: { freshKey?: string | null }) {
  const endpoint = useEndpoint();
  const s = guideSnippets(endpoint, freshKey);
  const filled = Boolean(freshKey);
  return (
    <section className={styles.box} aria-label="So bindest du die Website in Claude ein">
      <h3>Website per Claude pflegen</h3>
      <p>
        Mit einem MCP-Schlüssel legt Claude (oder ein anderer KI-Assistent) Seiten als Entwurf an und ändert sie. Veröffentlichen und Offline-Nehmen
        geht nur, wenn du es beim Schlüssel unter „Werkzeuge“ ankreuzt. Der Schlüssel hat höchstens die Rechte deines Kontos.
      </p>
      <p>
        Adresse: <code>{s.endpoint}</code>
      </p>
      {filled ? (
        <p className={styles.fresh}>
          Der neue Schlüssel steht unten in den Einträgen. Kopiere ihn jetzt: Nach dem Speichern ist er nicht mehr sichtbar.
        </p>
      ) : (
        <p>
          Ersetze <code>{keyPlaceholder}</code> durch deinen Schlüssel. Er ist nur direkt nach dem Erzeugen sichtbar; hast du ihn nicht mehr, lege
          einen neuen Schlüssel an und lösche den alten.
        </p>
      )}

      <details open={filled}>
        <summary>Claude Desktop (oder claude.ai): Connector</summary>
        <p>
          „Customize“ → „Connectors“ → „+ Add“ → „Add custom connector“: Name <code>Website</code>, Adresse wie oben, Anmeldung „No sign in“. Unter
          „Request headers“ den Header <code>Authorization</code> mit dem Wert:
        </p>
        <Snippet value={s.authorization} />
        <p>Claude verbindet sich dabei aus der Cloud von Anthropic: Das geht nur mit der öffentlichen Live-Adresse bzw. deiner Domain (https).</p>
      </details>

      <details open={filled}>
        <summary>Claude Desktop: claude_desktop_config.json</summary>
        <p>
          Läuft auf deinem Rechner und braucht Node.js. Im Menü „Claude“ → „Settings…“ → „Developer“ → „Edit Config“ den Eintrag in die Datei
          übernehmen, danach Claude ganz beenden und neu starten:
        </p>
        <Snippet value={s.desktopConfig} />
      </details>

      <details open={filled}>
        <summary>Claude Code</summary>
        <Snippet value={s.claudeCode} />
      </details>

      <details open={filled}>
        <summary>Andere Agents (MCP über HTTP)</summary>
        <Snippet value={s.generic} />
      </details>

      <p>
        Previews sind geschützt und für Assistenten nicht erreichbar; nimm die Live-Adresse. Mit Passwortschutz der Website geht MCP nicht. Einen
        Schlüssel widerrufst du, indem du ihn löschst.
      </p>
    </section>
  );
}

/** Beim Bearbeiten eines Schlüssels (Feld vom Typ ui): mit dem eben erzeugten Schlüssel */
export function McpGuide() {
  const freshKey = useFormFields(([fields]) => fields?.apiKey?.value);
  return <McpGuideBox freshKey={typeof freshKey === "string" ? freshKey : null} />;
}

/** Über der Liste der Schlüssel: ohne Schlüssel */
export function McpGuideList() {
  return <McpGuideBox />;
}

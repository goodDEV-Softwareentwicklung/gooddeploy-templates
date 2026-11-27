// Anleitung auf der Seite der MCP-Schlüssel (ST-14-14, Kriterium 3): Adresse
// des eigenen Endpunkts und kopierbare Einträge für Claude Desktop, Claude Code
// und andere MCP-fähige Agents. Dargestellt in components/admin/McpGuide.tsx.
//
// Der Schlüssel steht nur direkt nach dem Erzeugen in den Einträgen (er ist
// danach nur noch gehasht gespeichert, plugins/siteMcp/apiKeys.ts); sonst
// steht dort der Platzhalter.
//
// Quellen (geprüft am 27.11.2026):
// - Claude Code: https://code.claude.com/docs/en/mcp
//   (`claude mcp add --transport http <name> <url> --header "Authorization: Bearer …"`)
// - Claude Desktop, Connector mit „Request headers“:
//   https://support.claude.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp
// - Claude Desktop über claude_desktop_config.json mit mcp-remote:
//   https://github.com/geelen/mcp-remote (Header über --header und AUTH_HEADER)

/** Platzhalter in den Einträgen, solange kein frisch erzeugter Schlüssel da ist */
export const keyPlaceholder = "<DEIN-MCP-SCHLÜSSEL>";

/** Name des Servers in den Clients */
export const serverName = "website";

/** Adresse des Endpunkts, z. B. https://www.example.com/api/mcp */
export function mcpEndpoint(origin: string, apiRoute = "/api"): string {
  return `${origin.replace(/\/+$/, "")}${apiRoute}/mcp`;
}

export type GuideSnippets = {
  endpoint: string;
  /** Wert des Headers Authorization */
  authorization: string;
  /** Claude Desktop: claude_desktop_config.json mit mcp-remote (braucht Node.js) */
  desktopConfig: string;
  /** Claude Code */
  claudeCode: string;
  /** Andere Agents: Adresse, Transport, Header */
  generic: string;
};

/** Ein Schlüssel kommt nur in die Einträge, wenn er gerade erzeugt wurde (sonst Platzhalter). */
export function guideSnippets(endpoint: string, freshKey?: string | null): GuideSnippets {
  const key = typeof freshKey === "string" && freshKey.trim() ? freshKey.trim() : keyPlaceholder;
  const authorization = `Bearer ${key}`;
  const desktopConfig = JSON.stringify(
    {
      mcpServers: {
        [serverName]: {
          command: "npx",
          // Ohne Leerzeichen in args (Fehler von Claude Desktop unter Windows), der Wert steht in env.
          args: ["-y", "mcp-remote", endpoint, "--header", "Authorization:${AUTH_HEADER}"],
          env: { AUTH_HEADER: authorization },
        },
      },
    },
    null,
    2,
  );
  const claudeCode = `claude mcp add --transport http ${serverName} ${endpoint} --header "Authorization: ${authorization}"`;
  const generic = [`Adresse:   ${endpoint}`, "Transport: Streamable HTTP", `Header:    Authorization: ${authorization}`].join("\n");
  return { endpoint, authorization, desktopConfig, claudeCode, generic };
}

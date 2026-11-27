// Anfragen an /api/mcp vor dem Plugin begrenzen: Die allgemeinen Werkzeuge des
// Plugins (findMedia, findReusableBlocks, findSiteSettings) nehmen `depth`,
// `populate` und `joins` vom Client an und lösen damit Verweise auf, z. B.
// Personen in Modulen. Hier wird das wie bei read_page auf Tiefe 0 gesetzt:
// Verweise bleiben IDs. Leicht (ohne MCP-SDK), läuft vor dem Lazy-Load.

/** Werkzeuge des Plugins, die Verweise auflösen könnten */
export const depthLimitedTools = new Set(["findMedia", "findReusableBlocks", "findSiteSettings"]);

type Message = { method?: unknown; params?: { name?: unknown; arguments?: Record<string, unknown> } };

function limit(message: Message): Message {
  if (message?.method !== "tools/call" || typeof message.params?.name !== "string" || !depthLimitedTools.has(message.params.name)) return message;
  const { populate: _p, joins: _j, ...rest } = message.params.arguments ?? {};
  return { ...message, params: { ...message.params, arguments: { ...rest, depth: 0 } } };
}

/** JSON-RPC-Nachricht (oder Stapel) mit Tiefe 0 für die Werkzeuge oben; anderes unverändert */
export function limitDepth(body: unknown): unknown {
  return Array.isArray(body) ? body.map((m) => limit(m as Message)) : limit(body as Message);
}

/** Größte Anfrage an /api/mcp (JSON-RPC; Seiten mit vielen Modulen bleiben weit darunter) */
export const maxMcpRequestBytes = 1024 * 1024;

/**
 * Liest den Rohinhalt höchstens bis `limit` Bytes und bricht sonst ab, auch
 * ohne oder mit falscher Content-Length. Läuft vor der Schlüsselprüfung des
 * Plugins: Ohne Grenze könnte jeder ohne Anmeldung beliebig große Anfragen in
 * den Speicher schicken.
 */
export async function readLimitedText(
  body: ReadableStream<Uint8Array> | null,
  declaredLength: string | null,
  limit = maxMcpRequestBytes,
): Promise<string | "too-large"> {
  if (Number(declaredLength ?? 0) > limit) {
    await body?.cancel().catch(() => {});
    return "too-large";
  }
  if (!body) return "";
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > limit) {
      await reader.cancel().catch(() => {});
      return "too-large";
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** Schlüssel im Header vorhanden (die eigentliche Prüfung macht das Plugin) */
export const hasBearer = (authorization: string | null) => /^Bearer \S+/.test(authorization ?? "");

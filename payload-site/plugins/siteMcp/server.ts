// Schwerer Teil des MCP-Zugangs: offizielles Plugin (MCP-SDK, Zod) und die
// eigenen Werkzeuge (Zod, Lexical-Konverter). Wird erst beim ersten Aufruf von
// /api/mcp per import() geladen, nie beim Start.
//
// Der Endpunkt-Handler stammt aus dem Plugin selbst: Es wird einmal auf eine
// leere Konfiguration angewendet, die dabei erzeugten Handler für POST und GET
// werden übernommen. Schlüsselprüfung und Freigaben bleiben damit genau die des
// Plugins. Die Anweisungen an den Client stehen fest in options.ts.
import { mcpPlugin } from "@payloadcms/plugin-mcp";
import type { Config, PayloadHandler } from "payload";
import { mcpCollections, mcpGlobals, mcpInstructions, serverInfo } from "./options.ts";
import { siteMcpTools } from "./tools.ts";
import { mcpKeyContext } from "./upload.ts";

export async function createMcpHandlers(): Promise<{ post: PayloadHandler; get: PayloadHandler }> {
  const plugin = mcpPlugin({
    userCollection: "users",
    collections: mcpCollections,
    globals: mcpGlobals,
    mcp: { tools: siteMcpTools, serverOptions: { serverInfo, instructions: mcpInstructions } },
    // Prüfung des Schlüssels bleibt die des Plugins; die ID des Schlüssels merken,
    // damit ein Upload-Link an den Schlüssel gebunden ist (upload.ts).
    overrideAuth: async (req, getDefaultMcpAccessSettings) => {
      const settings = await getDefaultMcpAccessSettings();
      req.context = { ...req.context, [mcpKeyContext]: (settings as { id?: number }).id };
      return settings;
    },
  });
  const config = await plugin({ collections: [], endpoints: [] } as unknown as Config);
  const find = (method: string) => config.endpoints?.find((endpoint) => endpoint.path === "/mcp" && endpoint.method === method)?.handler;
  const post = find("post");
  const get = find("get");
  if (!post || !get) throw new Error("MCP-Plugin hat keinen Endpunkt /mcp erzeugt");
  return { post, get };
}

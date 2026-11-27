// AK-ST-14-14-3: Anleitung auf der Seite der MCP-Schlüssel. Einträge für
// Claude Desktop, Claude Code und andere Agents; der Schlüssel steht nur darin,
// wenn er gerade erzeugt wurde (Quellen der Befehle: lib/mcp-guide.ts).
import assert from "node:assert/strict";
import { test } from "node:test";
import { guideSnippets, keyPlaceholder, mcpEndpoint, serverName } from "../lib/mcp-guide.ts";

const endpoint = mcpEndpoint("https://www.kunde.example/");

test("AK-ST-14-14-3 Adresse des eigenen Endpunkts", () => {
  assert.equal(endpoint, "https://www.kunde.example/api/mcp");
  assert.equal(mcpEndpoint("http://localhost:3000", "/cms-api"), "http://localhost:3000/cms-api/mcp");
});

test("AK-ST-14-14-3 ohne frischen Schlüssel nur der Platzhalter in allen Einträgen", () => {
  for (const key of [undefined, null, "", "   "]) {
    const s = guideSnippets(endpoint, key);
    for (const text of [s.authorization, s.desktopConfig, s.claudeCode, s.generic]) {
      assert.ok(text.includes(keyPlaceholder), text);
    }
  }
});

test("AK-ST-14-14-3 Claude Code: claude mcp add mit HTTP-Transport und Header", () => {
  const s = guideSnippets(endpoint, "test-secret-5f0c");
  assert.equal(
    s.claudeCode,
    `claude mcp add --transport http ${serverName} https://www.kunde.example/api/mcp --header "Authorization: Bearer test-secret-5f0c"`,
  );
  assert.equal(s.authorization, "Bearer test-secret-5f0c");
});

test("AK-ST-14-14-3 Claude Desktop: claude_desktop_config.json mit mcp-remote, Header ohne Leerzeichen in args", () => {
  const config = JSON.parse(guideSnippets(endpoint, "test-secret-5f0c").desktopConfig);
  assert.deepEqual(config, {
    mcpServers: {
      [serverName]: {
        command: "npx",
        args: ["-y", "mcp-remote", "https://www.kunde.example/api/mcp", "--header", "Authorization:${AUTH_HEADER}"],
        env: { AUTH_HEADER: "Bearer test-secret-5f0c" },
      },
    },
  });
  for (const arg of config.mcpServers[serverName].args) assert.ok(!arg.includes(" "), arg);
});

test("AK-ST-14-14-3 andere Agents: Adresse, Transport und Header", () => {
  const s = guideSnippets(endpoint, "test-secret-5f0c");
  assert.match(s.generic, /Adresse: +https:\/\/www\.kunde\.example\/api\/mcp/);
  assert.match(s.generic, /Transport: Streamable HTTP/);
  assert.match(s.generic, /Header: +Authorization: Bearer test-secret-5f0c/);
});

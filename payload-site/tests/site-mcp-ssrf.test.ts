// AK-ST-14-14-4: Bilder aus dem Netz (import_image) nur aus dem öffentlichen
// Netz. Nachträge aus dem Review von !736 (Note 14227): IPv6-Schreibweisen von
// IPv4, DNS-Rebinding, harte Größengrenze, Upload-Link an den Schlüssel gebunden,
// Tiefe 0 für die allgemeinen Werkzeuge.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { connect, createServer, type Server } from "node:net";
import { test } from "node:test";
import type { Payload } from "payload";
import { checkImageUrl, fetchImage, isPrivateAddress, type GetFn, type ImageResponse } from "../plugins/siteMcp/imageUrl.ts";
import { depthLimitedTools, limitDepth } from "../plugins/siteMcp/request.ts";
import { keyStillValidSql, redeemTokenSql, redeemUpload } from "../plugins/siteMcp/upload.ts";

const source = (name: string) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
const publicLookup = async () => [{ address: "93.184.216.34", family: 4 }];
const internal = "Interne Adressen sind nicht erlaubt.";

test("AK-ST-14-14-4 SSRF: IPv6-Schreibweisen von IPv4 und Sondernetze werden über checkImageUrl abgelehnt", async () => {
  const blocked = [
    "https://[::ffff:127.0.0.1]:8443/a.png", // vom URL-Parser zu [::ffff:7f00:1]
    "https://[::ffff:7f00:1]/a.png",
    "https://[::ffff:a9fe:a9fe]/", // 169.254.169.254 (Metadaten)
    "https://[::127.0.0.1]/", // IPv4-compatible, ::7f00:1
    "https://[::7f00:1]/",
    "https://[64:ff9b::7f00:1]/", // NAT64
    "https://[64:ff9b:1::a00:1]/", // NAT64 lokal
    "https://[2002:7f00:1::]/", // 6to4
    "https://[2001:0:4136:e378:8000:63bf:3fff:fdd2]/", // Teredo
    "https://[::1]/",
    "https://[::]/",
    "https://[fe80::1]/",
    "https://[fd00::1]/",
    "https://[ff02::1]/",
    "https://127.0.0.1/",
    "https://2130706433/", // 127.0.0.1 als Zahl
    "https://0x7f.1/",
    "https://169.254.169.254/latest/meta-data/",
    "https://10.0.0.1/",
    "https://100.64.0.1/",
    "https://0.0.0.0/",
  ];
  for (const url of blocked) assert.equal(await checkImageUrl(url, publicLookup), internal, url);
  // Name, der auf eine interne Adresse zeigt
  for (const address of ["127.0.0.1", "::ffff:7f00:1", "fd00::1", "64:ff9b::a9fe:a9fe"]) {
    assert.equal(await checkImageUrl("https://bilder.example/a.png", async () => [{ address }]), internal, address);
  }
  assert.match((await checkImageUrl("http://example.org/a.png", publicLookup))!, /https/);
  assert.match((await checkImageUrl("https://localhost/a.png", publicLookup))!, /Intern/);
  // öffentliche Adressen bleiben erlaubt
  for (const url of ["https://example.org/a.png", "https://1.1.1.1/a.png", "https://[2606:4700::1111]/a.png"]) {
    assert.equal(await checkImageUrl(url, publicLookup), undefined, url);
  }
  for (const ip of ["::ffff:7f00:1", "::ffff:a9fe:a9fe", "64:ff9b::7f00:1", "::7f00:1", "nicht-ip"]) assert.equal(isPrivateAddress(ip), true, ip);
  for (const ip of ["93.184.216.34", "2606:4700::1111"]) assert.equal(isPrivateAddress(ip), false, ip);
});

async function listen(): Promise<{ server: Server; port: number; connections: () => number }> {
  let count = 0;
  const server = createServer((socket) => {
    count++;
    socket.destroy();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("kein Port");
  return { server, port: address.port, connections: () => count };
}

test("AK-ST-14-14-4 SSRF: ein Server auf 127.0.0.1 wird nicht erreicht, auch nicht per DNS-Rebinding", async () => {
  const { server, port, connections } = await listen();
  try {
    // Gegenprobe: ohne Schutz käme die Verbindung an (sonst wäre der Test wertlos).
    await new Promise<void>((resolve) => {
      const socket = connect(port, "127.0.0.1", () => socket.destroy());
      socket.on("close", () => resolve());
      socket.on("error", () => resolve());
    });
    await new Promise((r) => setTimeout(r, 50));
    const baseline = connections();
    assert.ok(baseline >= 1, "Testserver erreichbar");

    assert.deepEqual(await fetchImage(`https://[::ffff:127.0.0.1]:${port}/a.png`), { error: internal });
    // Rebinding: Prüfung sieht eine öffentliche Adresse, der Verbindungsaufbau bekäme 127.0.0.1.
    let calls = 0;
    const rebinding = async () => (calls++ === 0 ? [{ address: "93.184.216.34", family: 4 }] : [{ address: "127.0.0.1", family: 4 }]);
    assert.deepEqual(await fetchImage(`https://bilder.example:${port}/a.png`, { lookup: rebinding }), { error: internal });
    assert.ok(calls >= 2, "Verbindungsaufbau hat neu aufgelöst und geprüft");
    await new Promise((r) => setTimeout(r, 50));
    assert.equal(connections(), baseline, "keine Verbindung zu 127.0.0.1");
  } finally {
    server.close();
  }
});

const response = (status: number, headers: Record<string, string>, chunks: Buffer[] = []): ImageResponse => ({
  status,
  headers,
  body: (async function* () {
    yield* chunks;
  })(),
  abort: () => {},
});

test("AK-ST-14-14-4 SSRF: Weiterleitungen werden neu geprüft, Größe hart begrenzt auch ohne Content-Length, Fehler knapp", async () => {
  const redirect: GetFn = async () => response(302, { location: "https://[::ffff:7f00:1]/x" });
  assert.deepEqual(await fetchImage("https://example.org/a.png", { lookup: publicLookup, get: redirect }), { error: internal });

  let read = 0;
  const endless: GetFn = async () => ({
    status: 200,
    headers: { "content-type": "image/png" }, // ohne Content-Length (chunked)
    body: (async function* () {
      for (;;) {
        read++;
        yield Buffer.alloc(1024);
      }
    })(),
    abort: () => {},
  });
  assert.deepEqual(await fetchImage("https://example.org/a.png", { lookup: publicLookup, get: endless, maxBytes: 10 * 1024 }), {
    error: "Bild ist größer als 10 MB.",
  });
  assert.ok(read <= 12, `nach der Grenze abgebrochen (${read} Blöcke gelesen)`);

  const svg: GetFn = async () => response(200, { "content-type": "image/svg+xml" }, [Buffer.from("<svg/>")]);
  assert.deepEqual(await fetchImage("https://example.org/a.svg", { lookup: publicLookup, get: svg }), {
    error: "Kein erlaubtes Bildformat (image/svg+xml).",
  });

  const refused: GetFn = async () => {
    throw Object.assign(new Error("connect ECONNREFUSED 93.184.216.34:443"), { code: "ECONNREFUSED" });
  };
  assert.deepEqual(await fetchImage("https://example.org/a.png", { lookup: publicLookup, get: refused }), { error: "Abruf fehlgeschlagen." });

  const ok: GetFn = async () => response(200, { "content-type": "image/jpeg" }, [Buffer.alloc(4)]);
  assert.deepEqual(await fetchImage("https://example.org/fotos/Sommer%20Fest.JPG", { lookup: publicLookup, get: ok }), {
    data: Buffer.alloc(4),
    mimetype: "image/jpeg",
    name: "Sommer-Fest.jpg",
    size: 4,
  });
  assert.match(source("plugins/siteMcp/tools.ts"), /catch \{\s*return fail\("Abruf fehlgeschlagen\."\);/);
});

test("AK-ST-14-14-2 Upload-Link: atomar genau einmal einlösbar und an den Schlüssel gebunden (Widerruf wirkt sofort)", async () => {
  assert.match(redeemTokenSql, /^DELETE FROM mcp_upload_tokens WHERE token_hash = \$1 RETURNING /);
  assert.match(keyStillValidSql, /api_key_index IS NOT NULL/);
  assert.match(keyStillValidSql, /payload_mcp_tool_request_image_upload/);
  const token = "a".repeat(43);
  const fakePayload = (keyValid: boolean) => {
    let tokens = 1;
    return {
      db: {
        pool: {
          query: async (sql: string) => {
            if (sql === redeemTokenSql) {
              if (tokens === 0) return { rows: [] };
              tokens--;
              return { rows: [{ user_id: 1, mcp_key_id: 7, alt: "Bild", expires_at: new Date(Date.now() + 60_000).toISOString() }] };
            }
            if (sql === keyStillValidSql) return { rows: keyValid ? [{ "?column?": 1 }] : [] };
            throw new Error(`unerwartet: ${sql}`);
          },
        },
      },
    } as unknown as Payload;
  };
  const revoked = fakePayload(false);
  assert.equal((await redeemUpload(revoked, token, Buffer.from("x"))).status, 403, "widerrufener Schlüssel");
  assert.equal((await redeemUpload(revoked, token, Buffer.from("x"))).status, 404, "Link ist danach verbraucht");
  assert.match(source("plugins/siteMcp/server.ts"), /overrideAuth: async \(req, getDefaultMcpAccessSettings\)/);
  assert.match(source("plugins/siteMcp/upload.ts"), /mcpKey: req\.context\?\.\[mcpKeyContext\]/);
});

test("AK-ST-14-14-4 allgemeine Werkzeuge des Plugins lesen mit Tiefe 0 (Verweise bleiben IDs)", () => {
  assert.deepEqual([...depthLimitedTools].sort(), ["findMedia", "findReusableBlocks", "findSiteSettings"]);
  const call = (name: string, args: Record<string, unknown>) => ({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } });
  assert.deepEqual(
    limitDepth(call("findReusableBlocks", { depth: 3, populate: { people: true }, joins: {}, limit: 5 })),
    call("findReusableBlocks", { limit: 5, depth: 0 }),
  );
  assert.deepEqual(limitDepth([call("findSiteSettings", {}), call("read_page", { slug: "x" })]), [
    call("findSiteSettings", { depth: 0 }),
    call("read_page", { slug: "x" }),
  ]);
  const init = { jsonrpc: "2.0", id: 1, method: "initialize", params: {} };
  assert.deepEqual(limitDepth(init), init);
  assert.match(source("plugins/siteMcp/index.ts"), /body = JSON\.stringify\(limitDepth\(JSON\.parse\(text\)\)\)/);
});

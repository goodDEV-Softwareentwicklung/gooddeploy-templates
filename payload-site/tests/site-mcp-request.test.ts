// Anfragen an /api/mcp vor der Schlüsselprüfung: ohne Schlüssel im Header 401,
// ohne den Inhalt zu lesen; mit Schlüssel höchstens 1 MB, sonst 413 (Nachtrag
// aus der Re-Review-Notiz 14241 zu !736).
import assert from "node:assert/strict";
import { test } from "node:test";
import type { Config, PayloadRequest } from "payload";
import { siteMcp } from "../plugins/siteMcp/index.ts";
import { hasBearer, maxMcpRequestBytes, readLimitedText } from "../plugins/siteMcp/request.ts";

/** Strom mit `chunks` Blöcken zu je 64 KB; zählt, wie viele gelesen wurden */
function stream(chunks: number) {
  let read = 0;
  const body = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        if (read >= chunks) return controller.close();
        read++;
        controller.enqueue(new Uint8Array(64 * 1024));
      },
    },
    { highWaterMark: 0 },
  );
  return { body, read: () => read };
}

test("E228 Inhalt höchstens 1 MB, auch ohne Content-Length; angegebene Länge darüber wird gar nicht gelesen", async () => {
  assert.equal(maxMcpRequestBytes, 1024 * 1024);
  const small = stream(2);
  assert.equal((await readLimitedText(small.body, null))?.length, 128 * 1024);
  const endless = stream(1_000_000);
  assert.equal(await readLimitedText(endless.body, null), "too-large");
  assert.ok(endless.read() <= 18, `nach der Grenze abgebrochen (${endless.read()} Blöcke)`);
  const declared = stream(100);
  assert.equal(await readLimitedText(declared.body, String(2 * 1024 * 1024)), "too-large");
  assert.equal(declared.read(), 0, "bei zu großer Content-Length nichts gelesen");
  assert.equal(await readLimitedText(null, null), "");
});

test("E228 Schlüssel im Header nötig (Bearer)", () => {
  assert.equal(hasBearer("Bearer test-secret-1"), true);
  for (const value of [null, "", "Bearer ", "Basic abc", "bearer x"]) assert.equal(hasBearer(value), false, String(value));
});

async function postHandler() {
  const config = (await siteMcp()({ collections: [{ slug: "users", fields: [] }], endpoints: [] } as unknown as Config)) as Config;
  const endpoint = config.endpoints!.find((e) => e.path === "/mcp" && e.method === "post")!;
  return endpoint.handler;
}

const request = (headers: Record<string, string>, body: ReadableStream<Uint8Array>) =>
  ({ headers: new Headers(headers), body }) as unknown as PayloadRequest;

test("E228 POST /api/mcp: ohne Schlüssel 401 ohne Lesen, mit Schlüssel und mehr als 1 MB 413, vor dem MCP-Server", async () => {
  const handler = await postHandler();
  const anonymous = stream(1_000_000);
  const r1 = await handler(request({}, anonymous.body));
  assert.equal(r1.status, 401);
  assert.equal(anonymous.read(), 0, "Inhalt ohne Schlüssel nicht gelesen");

  const huge = stream(1_000_000);
  const r2 = await handler(request({ authorization: "Bearer test-secret-1" }, huge.body));
  assert.equal(r2.status, 413);
  assert.ok(huge.read() <= 18);

  const declared = stream(10);
  const r3 = await handler(request({ authorization: "Bearer test-secret-1", "content-length": String(5 * 1024 * 1024) }, declared.body));
  assert.equal(r3.status, 413);
  assert.equal(declared.read(), 0);
});

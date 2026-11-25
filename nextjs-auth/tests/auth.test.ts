// Tests der Anmeldung mit den echten Einstellungen (lib/auth-options.ts) und
// dem Memory-Adapter statt Postgres, über den HTTP-Handler wie die Formulare
// im Browser (/api/auth/*).
// - AK-ST-14-09-1: Grenzen gegen Passwort-Raten und Mail-Fluten.
// - AK-ST-14-09-1: Anfragen von nicht freigegebenen Adressen lehnt die
//   Anmeldung mit INVALID_ORIGIN ab; freigegebene Adressen bekommen Links auf
//   sich selbst.
import assert from "node:assert/strict";
import { once } from "node:events";
import net from "node:net";
import { test } from "node:test";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { authOptions, type Throttle } from "../lib/auth-options.ts";

const APP = "app-abc123.preview.example.test";

// Wie pgThrottle: Zählen und Lesen in einem Schritt, davor und danach eine
// kurze Wartezeit wie bei einer Datenbank, damit gleichzeitige Anfragen
// wirklich überlappen.
function memoryThrottle(): Throttle {
  const rows = new Map<string, { start: number; n: number }>();
  const latency = () => new Promise((r) => setTimeout(r, 2));
  return {
    async reserve(key, max, windowSeconds) {
      await latency();
      const now = Date.now();
      const row = rows.get(key);
      const next = !row || now - row.start >= windowSeconds * 1000 ? { start: now, n: 1 } : { start: row.start, n: row.n + 1 };
      rows.set(key, next);
      await latency();
      return next.n <= max;
    },
    async release(key) {
      await latency();
      const row = rows.get(key);
      if (row) row.n = Math.max(row.n - 1, 0);
    },
  };
}

function makeAuth(env: Record<string, string | undefined> = {}) {
  const db = { user: [], session: [], account: [], verification: [], rateLimit: [] };
  return betterAuth(
    authOptions({
      env: { NODE_ENV: "production", BETTER_AUTH_SECRET: "test-secret-0123456789abcdefghijklmnop", GOODDEPLOY_URL: `https://${APP}`, ...env }, // gitleaks:allow – Testwert
      database: memoryAdapter(db),
      throttle: memoryThrottle(),
      rateLimitStorage: "memory",
    }),
  );
}

type Auth = ReturnType<typeof makeAuth>;

let ipCounter = 0;
// Jede Anfrage von einer anderen IP-Adresse (Testnetz 198.18.0.0/15).
function freshIP(): string {
  ipCounter++;
  return `198.18.${Math.floor(ipCounter / 250)}.${(ipCounter % 250) + 1}`;
}

async function post(auth: Auth, path: string, body: unknown, opts: { host?: string; origin?: string; ip?: string } = {}) {
  const host = opts.host ?? APP;
  const origin = opts.origin ?? `https://${host}`;
  const ip = opts.ip ?? "198.51.100.7";
  const res = await auth.handler(
    new Request(`https://${host}/api/auth${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin,
        "x-forwarded-host": host,
        "x-forwarded-proto": "https",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify(body),
    }),
  );
  const text = await res.text();
  return { status: res.status, text };
}

async function signUp(auth: Auth, email: string, password = "test-secret-pw-123") {
  const r = await post(auth, "/sign-up/email", { name: "T", email, password }, { ip: freshIP() });
  assert.equal(r.status, 200, r.text);
}

test("Passwort-Raten von einer Adresse: nach 5 Versuchen je Minute 429", async () => {
  const auth = makeAuth();
  await signUp(auth, "brute@example.test");
  const statuses: number[] = [];
  for (let i = 0; i < 30; i++) {
    statuses.push((await post(auth, "/sign-in/email", { email: "brute@example.test", password: `falsch-${i}-xxxxxx` }, { ip: "198.51.100.20" })).status);
  }
  assert.equal(statuses.filter((s) => s === 401).length, 5, statuses.join(","));
  assert.equal(statuses.filter((s) => s === 429).length, 25);
});

test("verteiltes Passwort-Raten gegen ein Konto: nach 10 Versuchen je 15 Minuten gesperrt, auch für das richtige Passwort", async () => {
  const auth = makeAuth();
  await signUp(auth, "victim@example.test");
  const statuses: number[] = [];
  for (let i = 0; i < 12; i++) {
    statuses.push((await post(auth, "/sign-in/email", { email: "victim@example.test", password: `falsch-${i}-xxxxxx` }, { ip: freshIP() })).status);
  }
  assert.deepEqual(statuses.slice(0, 10), Array(10).fill(401));
  assert.deepEqual(statuses.slice(10), [429, 429]);
  const r = await post(auth, "/sign-in/email", { email: "victim@example.test", password: "test-secret-pw-123" }, { ip: freshIP() });
  assert.equal(r.status, 429);
  assert.match(r.text, /Zu viele Versuche für diese Adresse/);
});

test("50 gleichzeitige Fehlversuche von 50 IP-Adressen: höchstens 10 werden geprüft, der Rest 429", async () => {
  const auth = makeAuth();
  await signUp(auth, "parallel@example.test");
  const results = await Promise.all(
    Array.from({ length: 50 }, (_, i) =>
      post(auth, "/sign-in/email", { email: "parallel@example.test", password: `falsch-${i}-xxxxxx` }, { ip: freshIP() }),
    ),
  );
  const statuses = results.map((r) => r.status);
  assert.ok(statuses.filter((s) => s === 401).length <= 10, statuses.join(","));
  assert.equal(statuses.filter((s) => s === 401).length + statuses.filter((s) => s === 429).length, 50, statuses.join(","));
  const r = await post(auth, "/sign-in/email", { email: "parallel@example.test", password: "test-secret-pw-123" }, { ip: freshIP() });
  assert.equal(r.status, 429);
});

test("erfolgreiche Anmeldungen zählen nicht: 11 in Folge von mehreren Geräten, keine Sperre", async () => {
  const auth = makeAuth();
  await signUp(auth, "devices@example.test");
  for (let i = 0; i < 11; i++) {
    const r = await post(auth, "/sign-in/email", { email: "devices@example.test", password: "test-secret-pw-123" }, { ip: freshIP() });
    assert.equal(r.status, 200, `Anmeldung ${i + 1}: ${r.text}`);
  }
});

test("auch Aufrufe von auth.api auf dem Server zählen je E-Mail-Adresse", async () => {
  const auth = makeAuth();
  await signUp(auth, "server@example.test");
  let blocked = 0;
  for (let i = 0; i < 12; i++) {
    try {
      await auth.api.signInEmail({ body: { email: "server@example.test", password: `falsch-${i}-xxxxxx` } });
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode === 429) blocked++;
    }
  }
  assert.equal(blocked, 2);
});

async function smtpCatcher() {
  const mails: string[] = [];
  const server = net.createServer((socket) => {
    socket.setEncoding("utf8");
    let inData = false;
    let data = "";
    socket.write("220 catcher\r\n");
    socket.on("data", (chunk: string) => {
      if (inData) {
        data += chunk;
        if (data.includes("\r\n.\r\n")) {
          inData = false;
          mails.push(data);
          data = "";
          socket.write("250 ok\r\n");
        }
        return;
      }
      for (const line of chunk.split("\r\n").filter(Boolean)) {
        const cmd = line.slice(0, 4).toUpperCase();
        if (cmd === "DATA") {
          inData = true;
          socket.write("354 go\r\n");
        } else if (cmd === "QUIT") socket.end("221 bye\r\n");
        else socket.write("250 ok\r\n");
      }
    });
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address() as net.AddressInfo;
  const env = { SMTP_HOST: "127.0.0.1", SMTP_PORT: String(port), SMTP_FROM: "app@example.test" };
  return { mails, env, close: () => server.close() };
}

test("Mail-Flut über Passwort-Reset: höchstens 3 Mails je Adresse und 15 Minuten, auch von vielen IP-Adressen", async () => {
  const smtp = await smtpCatcher();
  try {
    const auth = makeAuth(smtp.env);
    await signUp(auth, "flood@example.test");
    smtp.mails.length = 0; // Bestätigungs-Mail der Registrierung
    for (let i = 0; i < 8; i++) {
      await post(auth, "/request-password-reset", { email: "flood@example.test", redirectTo: "/reset-password" }, { ip: freshIP() });
    }
    // Versand läuft im Hintergrund weiter; kurz warten.
    await new Promise((r) => setTimeout(r, 300));
    assert.equal(smtp.mails.length, 3);
  } finally {
    smtp.close();
  }
});

test("nicht freigegebene Adresse (eigene Domain ohne Eintrag): Anmeldung mit INVALID_ORIGIN abgelehnt", async () => {
  const auth = makeAuth();
  await signUp(auth, "domain@example.test");
  const r = await post(auth, "/sign-in/email", { email: "domain@example.test", password: "test-secret-pw-123" }, { host: "shop.example.de", ip: freshIP() });
  assert.equal(r.status, 403);
  assert.match(r.text, /INVALID_ORIGIN/);
});

test("freigegebene eigene Domain: Anmeldung geht, Links in Mails zeigen auf diese Domain", async () => {
  const smtp = await smtpCatcher();
  try {
    const auth = makeAuth({ BETTER_AUTH_ALLOWED_HOSTS: "shop.example.de", ...smtp.env });
    const r = await post(auth, "/sign-up/email", { name: "T", email: "shop@example.test", password: "test-secret-pw-123", callbackURL: "/dashboard" }, { host: "shop.example.de", ip: freshIP() });
    assert.equal(r.status, 200, r.text);
    await new Promise((res) => setTimeout(res, 300));
    assert.equal(smtp.mails.length, 1);
    const body = smtp.mails[0].replace(/=\r\n/g, "");
    assert.match(body, /https:\/\/shop\.example\.de\/api\/auth\/verify-email/);
  } finally {
    smtp.close();
  }
});

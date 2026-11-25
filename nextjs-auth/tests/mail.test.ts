// Tests für den E-Mail-Versand (AK-ST-14-09-2): ohne SMTP-Variablen aus,
// mit ihnen an; Versand gegen einen SMTP-Fänger im Test, ohne echte Mail.
// Aufruf: npm test (Node 22.18+ führt TypeScript direkt aus).
import assert from "node:assert/strict";
import { once } from "node:events";
import net from "node:net";
import { test } from "node:test";
import { mailConfig, mailEnabled, sendMail } from "../lib/mail.ts";

test("ohne SMTP-Variablen ist der Versand aus und nennt, was fehlt", () => {
  const cfg = mailConfig({});
  assert.equal(cfg.enabled, false);
  assert.deepEqual(!cfg.enabled && cfg.missing, ["SMTP_HOST", "SMTP_PORT", "SMTP_FROM"]);
  assert.equal(mailEnabled({ SMTP_HOST: "smtp.example.test", SMTP_PORT: "587" }), false);
});

test("ungültiger Port schaltet den Versand nicht ein", () => {
  assert.equal(mailEnabled({ SMTP_HOST: "h", SMTP_PORT: "abc", SMTP_FROM: "a@b.test" }), false);
});

test("mit SMTP-Variablen ist der Versand an", () => {
  const cfg = mailConfig({ SMTP_HOST: "smtp.example.test", SMTP_PORT: "465", SMTP_FROM: "App <app@example.test>", SMTP_SECURE: "true" });
  assert.equal(cfg.enabled, true);
  assert.equal(cfg.enabled && cfg.port, 465);
  assert.equal(cfg.enabled && cfg.secure, true);
});

test("sendMail schickt an einen lokalen SMTP-Fänger", async () => {
  const received: string[] = [];
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
          received.push(data);
          socket.write("250 ok\r\n");
        }
        return;
      }
      for (const line of chunk.split("\r\n").filter(Boolean)) {
        const cmd = line.slice(0, 4).toUpperCase();
        if (cmd === "EHLO" || cmd === "HELO") socket.write("250 catcher\r\n");
        else if (cmd === "DATA") {
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
  try {
    await sendMail(
      { to: "nutzer@example.test", subject: "Passwort zurücksetzen", text: "Link: https://app.example.test/reset" },
      { SMTP_HOST: "127.0.0.1", SMTP_PORT: String(port), SMTP_FROM: "app@example.test" },
    );
  } finally {
    server.close();
  }
  assert.equal(received.length, 1);
  assert.match(received[0], /To: nutzer@example\.test/);
  assert.match(received[0], /https:\/\/app\.example\.test\/reset/);
});

test("sendMail ohne Konfiguration bricht ab, statt still nichts zu tun", async () => {
  await assert.rejects(sendMail({ to: "a@example.test", subject: "x", text: "y" }, {}), /E-Mail-Versand ist aus/);
});

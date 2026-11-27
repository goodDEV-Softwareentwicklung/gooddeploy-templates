// Gegenbeispiele zum ersten Konto: ohne Anmeldung nur mit Einrichtungscode.
// Mit laufender App und echtem /api/users/first-register: starter_integration_test.go.
import assert from "node:assert/strict";
import { test } from "node:test";
import { type Field, sanitizeFields, type TextField } from "payload";
import { requireSetupCode, setupCodeMessage, Users } from "../collections/Users.ts";
import { setupCode, validSetupCode } from "../lib/setup-code.ts";

const secret = "test-secret-payload-1234567890";
process.env.PAYLOAD_SECRET = secret;

type Args = { data: Record<string, unknown>; operation: string; req: { user?: object } };
const hook = requireSetupCode as unknown as (a: Args) => Record<string, unknown>;
const data = { email: "a@example.invalid", password: "test-secret-pw" };

test("Einrichtungscode: 16 Zeichen Base32 in Vierergruppen, hängt nur am Geheimnis", () => {
  const code = setupCode(secret);
  assert.match(code, /^[A-Z2-7]{4}(-[A-Z2-7]{4}){3}$/);
  assert.equal(setupCode(secret), code);
  assert.notEqual(setupCode(secret + "x"), code);
  assert.ok(validSetupCode(secret, code));
  assert.ok(validSetupCode(secret, code.toLowerCase().replaceAll("-", " ")));
  for (const bad of [undefined, "", 42, code.slice(0, -1), code + "A", setupCode("anders")]) {
    assert.equal(validSetupCode(secret, bad), false, String(bad));
  }
});

test("erstes Konto ohne Code oder mit falschem Code abgelehnt (403)", () => {
  for (const extra of [{}, { setupCode: "AAAA-AAAA-AAAA-AAAA" }, { setupCode: setupCode("anderes-geheimnis") }]) {
    assert.throws(
      () => hook({ data: { ...data, ...extra }, operation: "create", req: {} }),
      (err: Error & { status?: number }) => err.message === setupCodeMessage && err.status === 403,
    );
  }
});

test("mit richtigem Code angelegt, der Code wird nicht gespeichert", () => {
  const out = hook({ data: { ...data, setupCode: setupCode(secret) }, operation: "create", req: {} });
  assert.deepEqual(out, data);
});

test("angemeldet (Admin legt weitere Konten an) und beim Bearbeiten kein Code nötig", () => {
  assert.deepEqual(hook({ data, operation: "create", req: { user: { id: 1 } } }), data);
  assert.deepEqual(hook({ data, operation: "update", req: {} }), data);
});

test("Feld Einrichtungscode nur ohne Anmeldung sichtbar und nie gespeichert", () => {
  const field = Users.fields.find((f) => "name" in f && f.name === "setupCode") as {
    virtual?: boolean;
    admin: { condition: (d: object, s: object, c: { user?: object }) => boolean };
  };
  assert.equal(field.virtual, true);
  assert.equal(field.admin.condition({}, {}, {}), true);
  assert.equal(field.admin.condition({}, {}, { user: { id: 1 } }), false);
});

// Payload sperrt virtuelle Felder im Admin-Panel (admin.readOnly = true, das
// Eingabefeld ist disabled), außer readOnly steht ausdrücklich auf false.
// Ohne das könnte man den Code im Formular für das erste Konto nicht eintippen.
test("Feld Einrichtungscode im Admin-Panel eintippbar (Payload sperrt virtuelle Felder sonst)", async () => {
  const readOnly = async (fields: Field[]) => {
    const out = await sanitizeFields({ config: {} as never, fields, parentIsLocalized: false, validRelationships: [] });
    const f = out.find((x) => "name" in x && x.name === "setupCode") as { admin: { readOnly?: boolean } };
    return f.admin.readOnly;
  };
  // sanitizeFields ändert die Felder: nur Kopien übergeben.
  const field = Users.fields.find((f) => "name" in f && f.name === "setupCode") as TextField;
  assert.equal(await readOnly([{ ...field, admin: { ...field.admin } }]), false);
  // Gegenbeispiel: ohne readOnly: false sperrt Payload das Feld.
  const { readOnly: _, ...admin } = field.admin ?? {};
  assert.equal(await readOnly([{ ...field, admin }]), true);
});

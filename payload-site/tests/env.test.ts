import assert from "node:assert/strict";
import { test } from "node:test";
import { missingS3Variables, payloadSecret, s3Settings } from "../lib/env.ts";

const full = {
  S3_ENDPOINT: "https://s3.example.invalid",
  S3_REGION: "gra",
  S3_BUCKET: "site",
  S3_ACCESS_KEY_ID: "test-access",
  S3_SECRET_ACCESS_KEY: "test-secret-s3",
};

test("ohne S3-Variablen kein Speicher, kein Hinweis auf fehlende", () => {
  assert.equal(s3Settings({}), null);
  assert.deepEqual(missingS3Variables({}), []);
});

test("mit allen S3-Variablen: Speicher mit Pfad-Adressen", () => {
  assert.deepEqual(s3Settings(full), {
    bucket: "site",
    endpoint: "https://s3.example.invalid",
    region: "gra",
    accessKeyId: "test-access",
    secretAccessKey: "test-secret-s3",
    forcePathStyle: true,
  });
});

test("AWS ohne Endpunkt: virtuelle Adressen, Region mit Standard", () => {
  const { S3_ENDPOINT, S3_REGION, ...aws } = full;
  const s = s3Settings(aws);
  assert.equal(s?.forcePathStyle, false);
  assert.equal(s?.region, "us-east-1");
  assert.equal(s3Settings({ ...full, S3_FORCE_PATH_STYLE: "false" })?.forcePathStyle, false);
});

test("S3 nur teilweise eingerichtet: aus, und die fehlenden Variablen werden genannt", () => {
  const { S3_SECRET_ACCESS_KEY, ...partial } = full;
  assert.equal(s3Settings(partial), null);
  assert.deepEqual(missingS3Variables(partial), ["S3_SECRET_ACCESS_KEY"]);
  assert.equal(s3Settings({ ...full, S3_BUCKET: "  " }), null);
});

test("PAYLOAD_SECRET: Pflicht in Produktion, Platzhalter nur beim Build und lokal", () => {
  assert.equal(payloadSecret({ PAYLOAD_SECRET: "test-secret-x", NODE_ENV: "production" }), "test-secret-x");
  assert.throws(() => payloadSecret({ NODE_ENV: "production" }), /PAYLOAD_SECRET fehlt.*gooddeploy env add PAYLOAD_SECRET/);
  assert.ok(payloadSecret({ NODE_ENV: "production", NEXT_PHASE: "phase-production-build" }));
  assert.ok(payloadSecret({ NODE_ENV: "development" }));
});

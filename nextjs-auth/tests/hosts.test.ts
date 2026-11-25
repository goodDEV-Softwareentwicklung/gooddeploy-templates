// Erlaubte Adressen der Anmeldung (lib/hosts.ts).
import assert from "node:assert/strict";
import { test } from "node:test";
import { allowedHosts, fallbackURL } from "../lib/hosts.ts";

test("Adresse der Version aus GOODDEPLOY_URL und eigene Domains", () => {
  const env = {
    NODE_ENV: "production",
    GOODDEPLOY_URL: "https://abc123-shop.preview.example.test",
    BETTER_AUTH_ALLOWED_HOSTS: "shop.example.de, www.shop.example.de",
  };
  assert.deepEqual(allowedHosts(env), ["abc123-shop.preview.example.test", "shop.example.de", "www.shop.example.de"]);
  assert.equal(fallbackURL(env), "https://abc123-shop.preview.example.test");
});

test("BETTER_AUTH_URL hat beim Fallback Vorrang", () => {
  assert.equal(fallbackURL({ GOODDEPLOY_URL: "https://a.test", BETTER_AUTH_URL: "https://b.test" }), "https://b.test");
});

test("localhost nur in der Entwicklung", () => {
  assert.ok(allowedHosts({ NODE_ENV: "development" }).includes("localhost:3000"));
  assert.ok(!allowedHosts({ NODE_ENV: "production", GOODDEPLOY_URL: "https://a.test" }).includes("localhost:3000"));
});

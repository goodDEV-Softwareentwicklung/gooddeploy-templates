// Anmeldung mit Better Auth: E-Mail und Passwort, Sitzungen, Grenzen gegen
// Passwort-Raten und Mail-Fluten in Postgres. Die Einstellungen stehen in
// lib/auth-options.ts.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { authOptions } from "./auth-options.ts";
import { pgThrottle } from "./throttle.ts";

const options = authOptions({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  throttle: pgThrottle,
});

export const auth = betterAuth({
  ...options,
  // Setzt das Sitzungs-Cookie auch bei Aufrufen aus Server Actions (Abmelden).
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

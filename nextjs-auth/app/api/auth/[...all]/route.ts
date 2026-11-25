// Alle Endpunkte von Better Auth unter /api/auth/* (Anmelden, Abmelden,
// Sitzung, Bestätigungslink, Passwort-Reset).
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);

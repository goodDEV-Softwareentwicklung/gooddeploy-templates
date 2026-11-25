// Einstellungen von Better Auth, ohne Datenbank-Anbindung: lib/auth.ts nutzt
// sie mit Postgres, die Tests (tests/auth.test.ts) mit dem Memory-Adapter.
import type { BetterAuthOptions } from "better-auth";
import { APIError, createAuthMiddleware, isAPIError } from "better-auth/api";
import { allowedHosts, fallbackURL } from "./hosts.ts";
import { mailEnabled, sendMail } from "./mail.ts";

type Env = Record<string, string | undefined>;

// Throttle zählt Versuche je Schlüssel (lib/throttle.ts: Postgres).
// reserve zählt atomar einen Versuch im Zeitfenster und meldet, ob er
// innerhalb von max liegt; gleichzeitige Anfragen werden dabei geordnet.
// release gibt einen reservierten Versuch zurück (erfolgreiche Anmeldung).
export type Throttle = {
  reserve: (key: string, max: number, windowSeconds: number) => Promise<boolean>;
  release: (key: string) => Promise<void>;
};

// Grenzen je E-Mail-Adresse, über alle Instanzen und IP-Adressen hinweg:
// gegen verteiltes Passwort-Raten und Mail-Fluten an eine Adresse. Beim
// Anmelden zählen nur Fehlversuche (failuresOnly); sind es zu viele, ist das
// Konto für das Zeitfenster gesperrt, auch für das richtige Passwort. Das ist
// der Preis gegen verteiltes Raten: Ein Dritter kann so ein Konto für 15
// Minuten aussperren. Anpassen hier, nicht entfernen.
export const emailLimits: Record<string, { max: number; windowSeconds: number; failuresOnly?: boolean }> = {
  "/sign-in/email": { max: 10, windowSeconds: 15 * 60, failuresOnly: true },
  "/sign-up/email": { max: 3, windowSeconds: 15 * 60 },
  "/request-password-reset": { max: 3, windowSeconds: 15 * 60 },
  "/send-verification-email": { max: 3, windowSeconds: 15 * 60 },
};

function throttleKey(path: string, body: unknown): string {
  const email = (body as { email?: unknown } | undefined)?.email;
  return typeof email === "string" && email.trim() ? `${path}:${email.trim().toLowerCase()}` : "";
}

export function authOptions({
  env = process.env,
  database,
  throttle,
  rateLimitStorage = "database",
}: {
  env?: Env;
  database: BetterAuthOptions["database"];
  throttle: Throttle;
  rateLimitStorage?: "database" | "memory";
}): BetterAuthOptions {
  const withMail = mailEnabled(env);
  // Beim Build (`next build`) gibt es keine Laufzeit-Variablen. Damit Better
  // Auth dort nicht abbricht, gilt nur dann ein Platzhalter; zur Laufzeit
  // prüft server.js, dass BETTER_AUTH_SECRET gesetzt ist.
  const isBuild = env.NEXT_PHASE === "phase-production-build";
  return {
    // Auf gooddeploy: gooddeploy env add BETTER_AUTH_SECRET (Wert z. B. aus
    // `openssl rand -base64 32`), nie ins Repo.
    secret: env.BETTER_AUTH_SECRET || (isBuild ? "build-only-placeholder-not-used-at-runtime" : undefined),
    baseURL: {
      // Previews und Live haben verschiedene Adressen; erlaubt sind nur die
      // eigenen (lib/hosts.ts). Anfragen an /api/auth/* von anderen
      // Adressen lehnt Better Auth mit INVALID_ORIGIN ab.
      allowedHosts: allowedHosts(env),
      fallback: fallbackURL(env),
    },
    database,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      // Ohne Mail-Versand kann niemand seine Adresse bestätigen; dann gilt
      // die Anmeldung ohne Bestätigung.
      requireEmailVerification: withMail,
      sendResetPassword: withMail
        ? async ({ user, url }) => {
            await sendMail(
              {
                to: user.email,
                subject: "Passwort zurücksetzen",
                text: `Hallo ${user.name},\n\nüber diesen Link setzt du ein neues Passwort:\n${url}\n\nWenn du das nicht warst, ignoriere diese Mail.`,
              },
              env,
            );
          }
        : undefined,
    },
    emailVerification: withMail
      ? {
          sendOnSignUp: true,
          autoSignInAfterVerification: true,
          sendVerificationEmail: async ({ user, url }) => {
            await sendMail(
              {
                to: user.email,
                subject: "E-Mail-Adresse bestätigen",
                text: `Hallo ${user.name},\n\nbitte bestätige deine Adresse über diesen Link:\n${url}`,
              },
              env,
            );
          },
        }
      : undefined,
    // Grenzen je IP-Adresse für alle Anfragen an /api/auth/* (die Formulare
    // schicken dorthin). In Postgres, damit sie über mehrere Instanzen gelten.
    rateLimit: {
      enabled: true,
      storage: rateLimitStorage,
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 3 },
        "/request-password-reset": { window: 300, max: 3 },
        "/send-verification-email": { window: 300, max: 3 },
      },
    },
    hooks: {
      // Grenzen je E-Mail-Adresse (emailLimits); gelten auch für Aufrufe von
      // auth.api.* auf dem Server.
      before: createAuthMiddleware(async (ctx) => {
        const limit = emailLimits[ctx.path];
        const key = throttleKey(ctx.path, ctx.body);
        if (!limit || !key) return;
        // Vor der Passwortprüfung reservieren: So kommen auch gleichzeitig
        // geschickte Versuche nicht an der Grenze vorbei.
        if (!(await throttle.reserve(key, limit.max, limit.windowSeconds))) {
          throw new APIError("TOO_MANY_REQUESTS", {
            message: "Zu viele Versuche für diese Adresse. Bitte warte 15 Minuten.",
          });
        }
      }),
      // Beim Anmelden zählen nur Fehlversuche (401): Alles andere (Erfolg,
      // unbestätigte Adresse, ungültige Eingabe) gibt die Reservierung zurück.
      after: createAuthMiddleware(async (ctx) => {
        const limit = emailLimits[ctx.path];
        const key = throttleKey(ctx.path, ctx.body);
        if (!limit?.failuresOnly || !key) return;
        const returned = ctx.context.returned;
        if (!(isAPIError(returned) && returned.statusCode === 401)) await throttle.release(key);
      }),
    },
    advanced: {
      // Auf gooddeploy steht ein Proxy vor der App und setzt X-Forwarded-Host,
      // X-Forwarded-Proto und X-Forwarded-For (Adresse des Besuchers) selbst.
      trustedProxyHeaders: true,
    },
    // Keine Nutzungsdaten an Better Auth senden.
    telemetry: { enabled: false },
  };
}

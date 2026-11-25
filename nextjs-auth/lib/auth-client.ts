// Better Auth im Browser: Die Formulare schicken an /api/auth/* derselben
// Adresse. Dort gelten die Prüfungen von Better Auth (Herkunft, Grenzen je
// IP-Adresse) und die Grenzen je E-Mail-Adresse (lib/auth-options.ts).
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

// Fehlermeldungen von Better Auth auf Deutsch.
export function errorText(err: { code?: string; status?: number; message?: string } | null | undefined): string {
  if (!err) return "";
  if (err.status === 429) return err.message?.startsWith("Zu viele") ? err.message : "Zu viele Versuche. Bitte warte kurz.";
  switch (err.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "E-Mail oder Passwort stimmt nicht.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "Für diese Adresse gibt es schon ein Konto. Melde dich an.";
    case "EMAIL_NOT_VERIFIED":
      return "Bitte bestätige zuerst deine Adresse über den Link in der Mail.";
    case "PASSWORD_TOO_SHORT":
      return "Das Passwort ist zu kurz (mindestens 10 Zeichen).";
    case "INVALID_TOKEN":
      return "Der Link ist ungültig oder abgelaufen. Fordere einen neuen an.";
    case "INVALID_ORIGIN":
      return "Diese Adresse ist für die Anmeldung nicht freigegeben (BETTER_AUTH_ALLOWED_HOSTS, siehe README).";
  }
  return err.message || "Das hat nicht geklappt. Bitte später noch einmal versuchen.";
}

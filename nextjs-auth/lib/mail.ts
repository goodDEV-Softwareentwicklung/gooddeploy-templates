// E-Mail-Versand für Bestätigung und Passwort-Reset. Er ist nur an, wenn
// alle Pflicht-Variablen gesetzt sind; ohne sie läuft die App vollständig,
// nur ohne diese beiden Funktionen (die Oberfläche sagt das).
//
// Variablen (auf gooddeploy mit `gooddeploy env add`):
//   SMTP_HOST, SMTP_PORT, SMTP_FROM   Pflicht
//   SMTP_USER, SMTP_PASSWORD          wenn der Server Anmeldung verlangt
//   SMTP_SECURE=true                  TLS ab Verbindungsbeginn (meist Port 465);
//                                     sonst STARTTLS, wenn der Server es anbietet
import nodemailer from "nodemailer";

export const requiredMailVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_FROM"] as const;

export type MailConfig =
  | { enabled: false; missing: string[] }
  | {
      enabled: true;
      host: string;
      port: number;
      secure: boolean;
      from: string;
      user?: string;
      password?: string;
    };

type Env = Record<string, string | undefined>;

export function mailConfig(env: Env = process.env): MailConfig {
  const missing = requiredMailVars.filter((name) => !env[name]?.trim());
  if (missing.length > 0) {
    return { enabled: false, missing };
  }
  const port = Number(env.SMTP_PORT);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    return { enabled: false, missing: ["SMTP_PORT (keine gültige Portnummer)"] };
  }
  return {
    enabled: true,
    host: env.SMTP_HOST!.trim(),
    port,
    secure: env.SMTP_SECURE === "true",
    from: env.SMTP_FROM!.trim(),
    user: env.SMTP_USER || undefined,
    password: env.SMTP_PASSWORD || undefined,
  };
}

export function mailEnabled(env: Env = process.env): boolean {
  return mailConfig(env).enabled;
}

export async function sendMail(
  message: { to: string; subject: string; text: string },
  env: Env = process.env,
): Promise<void> {
  const cfg = mailConfig(env);
  if (!cfg.enabled) {
    throw new Error(`E-Mail-Versand ist aus, es fehlt: ${cfg.missing.join(", ")}`);
  }
  const transport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.user ? { user: cfg.user, pass: cfg.password ?? "" } : undefined,
  });
  await transport.sendMail({ from: cfg.from, ...message });
}

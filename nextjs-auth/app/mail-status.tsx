import { mailEnabled } from "@/lib/mail";

// Sagt auf der Oberfläche, ob Mails verschickt werden (Bestätigung,
// Passwort-Reset). Ohne SMTP-Variablen ist das aus.
export function MailStatus() {
  if (mailEnabled()) {
    return (
      <p className="muted" data-mail="on">
        E-Mail-Versand ist an: Bestätigung der Adresse und Passwort-Reset per Mail.
      </p>
    );
  }
  return (
    <p className="note" data-mail="off">
      E-Mail-Versand ist aus: Neue Konten brauchen keine Bestätigung, und „Passwort vergessen“ gibt es nicht. Einschalten
      mit den SMTP-Variablen (siehe README).
    </p>
  );
}

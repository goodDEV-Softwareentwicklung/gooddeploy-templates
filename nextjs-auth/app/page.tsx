import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { MailStatus } from "./mail-status";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <>
      <h1>Startvorlage</h1>
      <p className="lead">Next.js mit Anmeldung (Better Auth) und eigener Postgres-Datenbank.</p>
      {session ? (
        <>
          <p>Angemeldet als {session.user.email}.</p>
          <div className="actions">
            <Link className="button" href="/dashboard">
              Zu deinen Notizen
            </Link>
          </div>
        </>
      ) : (
        <>
          <p>Ein fertiges Konto gibt es nicht: Lege dein erstes Konto selbst unter Registrieren an.</p>
          <div className="actions">
            <Link className="button" href="/signup">
              Registrieren
            </Link>
            <Link className="button secondary" href="/login">
              Anmelden
            </Link>
          </div>
        </>
      )}
      <MailStatus />
    </>
  );
}

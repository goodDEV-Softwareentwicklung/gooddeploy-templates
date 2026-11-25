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
      <p>Next.js mit Anmeldung (Better Auth) und Postgres, bereit für gooddeploy.</p>
      {session ? (
        <p>
          Angemeldet als {session.user.email}. <Link href="/dashboard">Zum Bereich</Link>
        </p>
      ) : (
        <p>
          <Link href="/signup">Registrieren</Link> · <Link href="/login">Anmelden</Link>
        </p>
      )}
      <MailStatus />
    </>
  );
}

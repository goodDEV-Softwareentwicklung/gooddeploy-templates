import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

// Für geschützte Seiten: liefert die Sitzung oder leitet zur Anmeldung um.
// Die Prüfung passiert auf dem Server bei jeder Anfrage.
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }
  return session;
}

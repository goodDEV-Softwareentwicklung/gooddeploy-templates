import Link from "next/link";
import { mailEnabled } from "@/lib/mail";
import { MailStatus } from "../mail-status";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="narrow">
      <h1>Anmelden</h1>
      <LoginForm />
      <p className="muted">
        Noch kein Konto? <Link href="/signup">Registrieren</Link>
        {mailEnabled() && (
          <>
            {" "}
            · <Link href="/forgot-password">Passwort vergessen?</Link>
          </>
        )}
      </p>
      <MailStatus />
    </div>
  );
}

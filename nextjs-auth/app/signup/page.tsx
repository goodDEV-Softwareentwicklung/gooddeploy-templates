import Link from "next/link";
import { mailEnabled } from "@/lib/mail";
import { MailStatus } from "../mail-status";
import { SignUpForm } from "./signup-form";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="narrow">
      <h1>Registrieren</h1>
      <SignUpForm withMail={mailEnabled()} />
      <p className="muted">
        Schon ein Konto? <Link href="/login">Anmelden</Link>
      </p>
      <MailStatus />
    </div>
  );
}

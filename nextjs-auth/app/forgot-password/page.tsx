import { notFound } from "next/navigation";
import { mailEnabled } from "@/lib/mail";
import { ForgotForm } from "./forgot-form";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  // Ohne Mail-Versand gibt es diese Seite nicht.
  if (!mailEnabled()) notFound();
  return (
    <>
      <h1>Passwort vergessen</h1>
      <ForgotForm />
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { mailEnabled } from "@/lib/mail";
import { ResetForm } from "./reset-form";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  if (!mailEnabled()) notFound();
  const { token } = await searchParams;
  if (!token) {
    return (
      <div className="narrow">
        <h1>Neues Passwort</h1>
        <p className="error" role="alert">
          Der Link ist unvollständig oder abgelaufen. <Link href="/forgot-password">Fordere einen neuen an.</Link>
        </p>
      </div>
    );
  }
  return (
    <div className="narrow">
      <h1>Neues Passwort</h1>
      <ResetForm token={token} />
    </div>
  );
}

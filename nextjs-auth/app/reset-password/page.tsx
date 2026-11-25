import { notFound } from "next/navigation";
import { mailEnabled } from "@/lib/mail";
import { ResetForm } from "./reset-form";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  if (!mailEnabled()) notFound();
  const { token } = await searchParams;
  if (!token) {
    return <p className="error">Der Link ist unvollständig oder abgelaufen. Fordere einen neuen an.</p>;
  }
  return (
    <>
      <h1>Neues Passwort</h1>
      <ResetForm token={token} />
    </>
  );
}

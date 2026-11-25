"use client";

import { useRouter } from "next/navigation";
import { authClient, errorText } from "@/lib/auth-client";
import { AuthForm } from "../auth-form";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  return (
    <AuthForm
      submit="Passwort speichern"
      onSubmit={async (form) => {
        const { error } = await authClient.resetPassword({ token, newPassword: String(form.get("password") ?? "") });
        if (error) return { error: errorText(error) };
        router.push("/login");
      }}
    >
      <label>
        Neues Passwort (mindestens 10 Zeichen)
        <input name="password" type="password" required minLength={10} autoComplete="new-password" />
      </label>
    </AuthForm>
  );
}

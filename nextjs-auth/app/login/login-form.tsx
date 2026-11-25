"use client";

import { useRouter } from "next/navigation";
import { authClient, errorText } from "@/lib/auth-client";
import { AuthForm } from "../auth-form";

export function LoginForm() {
  const router = useRouter();
  return (
    <AuthForm
      submit="Anmelden"
      onSubmit={async (form) => {
        const { error } = await authClient.signIn.email({
          email: String(form.get("email") ?? "").trim(),
          password: String(form.get("password") ?? ""),
        });
        if (error) return { error: errorText(error) };
        router.push("/dashboard");
        router.refresh();
      }}
    >
      <label>
        E-Mail
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Passwort
        <input name="password" type="password" required autoComplete="current-password" />
      </label>
    </AuthForm>
  );
}

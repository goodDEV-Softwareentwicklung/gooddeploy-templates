"use client";

import { useRouter } from "next/navigation";
import { authClient, errorText } from "@/lib/auth-client";
import { AuthForm } from "../auth-form";

export function SignUpForm({ withMail }: { withMail: boolean }) {
  const router = useRouter();
  return (
    <AuthForm
      submit="Konto anlegen"
      onSubmit={async (form) => {
        const { error } = await authClient.signUp.email({
          name: String(form.get("name") ?? "").trim(),
          email: String(form.get("email") ?? "").trim(),
          password: String(form.get("password") ?? ""),
          callbackURL: "/dashboard",
        });
        if (error) return { error: errorText(error) };
        if (withMail) return { info: "Fast geschafft: Wir haben dir eine Mail mit einem Bestätigungslink geschickt." };
        router.push("/dashboard");
        router.refresh();
      }}
    >
      <label>
        Name
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        E-Mail
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Passwort (mindestens 10 Zeichen)
        <input name="password" type="password" required minLength={10} autoComplete="new-password" />
      </label>
    </AuthForm>
  );
}

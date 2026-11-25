"use client";

import { authClient, errorText } from "@/lib/auth-client";
import { AuthForm } from "../auth-form";

export function ForgotForm() {
  return (
    <AuthForm
      submit="Link schicken"
      onSubmit={async (form) => {
        const { error } = await authClient.requestPasswordReset({
          email: String(form.get("email") ?? "").trim(),
          redirectTo: "/reset-password",
        });
        if (error) return { error: errorText(error) };
        // Immer dieselbe Antwort, damit niemand erfährt, welche Adressen es gibt.
        return { info: "Wenn es ein Konto mit dieser Adresse gibt, ist eine Mail unterwegs." };
      }}
    >
      <label>
        E-Mail
        <input name="email" type="email" required autoComplete="email" />
      </label>
    </AuthForm>
  );
}

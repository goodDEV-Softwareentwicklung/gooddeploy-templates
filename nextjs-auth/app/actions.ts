"use server";

// Server Actions für Abmelden und die Notizen. Registrieren, Anmelden und
// Passwort-Reset laufen im Browser über /api/auth/* (lib/auth-client.ts),
// damit die Grenzen gegen Passwort-Raten greifen.
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/session";

export async function signOut(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

export async function addNote(form: FormData): Promise<void> {
  const session = await requireSession();
  const body = String(form.get("body") ?? "").trim().slice(0, 500);
  if (body) {
    await db.insert(notes).values({ userId: session.user.id, body });
  }
  revalidatePath("/dashboard");
}

export async function deleteNote(form: FormData): Promise<void> {
  const session = await requireSession();
  const id = Number(form.get("id"));
  if (Number.isInteger(id)) {
    await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, session.user.id)));
  }
  revalidatePath("/dashboard");
}

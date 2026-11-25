import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";

// Nur die eigenen Notizen: Die Trennung je Nutzer steht im WHERE. Bewusst
// keine Server Action, sonst könnte jeder Browser sie mit fremder userId
// aufrufen.
export async function notesOf(userId: string) {
  return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.id)).limit(50);
}

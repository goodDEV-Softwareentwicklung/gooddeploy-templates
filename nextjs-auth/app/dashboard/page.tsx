import { notesOf } from "@/lib/notes";
import { requireSession } from "@/lib/session";
import { addNote, deleteNote, signOut } from "../actions";

export const dynamic = "force-dynamic";

// Geschützte Beispielseite: nur mit Sitzung, sonst Umleitung auf /login.
export default async function DashboardPage() {
  const session = await requireSession();
  const list = await notesOf(session.user.id);
  return (
    <>
      <h1>Dein Bereich</h1>
      <p data-user={session.user.email}>
        Angemeldet als <strong>{session.user.email}</strong>
      </p>
      <form action={addNote}>
        <label>
          Neue Notiz (nur du siehst sie)
          <input name="body" required maxLength={500} />
        </label>
        <button type="submit">Speichern</button>
      </form>
      <ul>
        {list.map((n) => (
          <li key={n.id}>
            {n.body}{" "}
            <form action={deleteNote} style={{ display: "inline", padding: 0, border: 0, background: "none" }}>
              <input type="hidden" name="id" value={n.id} />
              <button type="submit" aria-label="Notiz löschen">
                ×
              </button>
            </form>
          </li>
        ))}
      </ul>
      <form action={signOut}>
        <button type="submit">Abmelden</button>
      </form>
    </>
  );
}

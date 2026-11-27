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
      <div className="topbar">
        <h1>Deine Notizen</h1>
        <form action={signOut}>
          <button type="submit" className="secondary">
            Abmelden
          </button>
        </form>
      </div>
      <p className="muted" data-user={session.user.email}>
        Angemeldet als <strong>{session.user.email}</strong>
      </p>
      <form action={addNote} className="card add-note">
        <label>
          Neue Notiz (nur du siehst sie)
          <input name="body" required maxLength={500} />
        </label>
        <button type="submit">Speichern</button>
      </form>
      {list.length === 0 ? (
        <p className="empty" data-empty="notes">
          Noch keine Notizen. Das ist deine App, eine Next.js-Vorlage mit Anmeldung und eigener Datenbank: Weiterbauen
          kannst du in <code>db/schema.ts</code> (Tabellen) und <code>app/dashboard</code> (diese Seite).
        </p>
      ) : (
        <ul className="notes">
          {list.map((n) => (
            <li key={n.id}>
              <span>{n.body}</span>
              <form action={deleteNote}>
                <input type="hidden" name="id" value={n.id} />
                <button type="submit" className="icon-button" aria-label="Notiz löschen" title="Notiz löschen">
                  ×
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

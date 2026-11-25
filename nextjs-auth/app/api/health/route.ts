// Health-Check: gooddeploy prüft nach dem Start einer Version, ob die App
// antwortet. 200 nur, wenn die Datenbank erreichbar ist.
import { sql } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  if (!process.env.DATABASE_URL) {
    return Response.json({ status: "error", db: "not_configured" }, { status: 503 });
  }
  try {
    await sql()`select 1`;
    return Response.json({ status: "ok", db: "ok" });
  } catch {
    // Keine Details nach außen; die Ursache steht in gooddeploy logs.
    console.error("health: Datenbank nicht erreichbar");
    return Response.json({ status: "error", db: "unreachable" }, { status: 503 });
  }
}

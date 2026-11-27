// Health-Check: gooddeploy prüft nach dem Start einer Version, ob die App
// antwortet. 200 nur, wenn die Datenbank erreichbar ist.
import { getPayload } from "payload";
import config from "@payload-config";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const payload = await getPayload({ config });
    await payload.db.pool.query("select 1");
    return Response.json({ status: "ok", db: "ok" });
  } catch {
    // Keine Details nach außen; die Ursache steht in gooddeploy logs.
    console.error("health: Datenbank nicht erreichbar");
    return Response.json({ status: "error", db: "unreachable" }, { status: 503 });
  }
}

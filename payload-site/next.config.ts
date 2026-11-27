import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // gooddeploy startet .next/standalone/server.js (kleines Image ohne volles
  // node_modules). Die Migrationen laufen beim Start über instrumentation.ts.
  output: "standalone",
  poweredByHeader: false,
  // Next.js schreibt sonst bei `next dev` eigene Regeln in AGENTS.md (die Datei gehört der Vorlage).
  agentRules: false,
  images: {
    // Bilder liefert Payload unter /api/media/file/… aus (aus dem S3-Speicher),
    // die Beispielbilder der Vorlage liegen in public/samples/.
    localPatterns: [{ pathname: "/api/media/file/**" }, { pathname: "/samples/**" }],
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });

import type { NextConfig } from "next";

// Bewusst ohne `output: "standalone"`: gooddeploy startet dann die eigene
// server.js, die vor Next.js die Migrationen einspielt (siehe server.js).
const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default nextConfig;

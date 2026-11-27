// Next.js ruft register() einmal beim Start des Servers auf. Der Teil mit
// Datenbank und Payload liegt in einer eigenen Datei, damit er nie in die
// Edge-Runtime gebündelt wird.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node.ts");
  }
}

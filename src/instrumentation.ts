// Runs once when the Next.js server boots. We kick off the MongoDB connection
// here so the slow first-connect (Atlas free-tier cold start) happens at startup
// instead of while a user is staring at a loading screen.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { connectMongo } = await import("@/lib/mongodb");
      await connectMongo();
      console.log("[mongo] connection warmed at startup");
    } catch (error) {
      console.warn("[mongo] startup warmup failed (will retry on first request):", error);
    }
  }
}

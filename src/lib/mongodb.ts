import mongoose from "mongoose";

type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongo = globalThis as typeof globalThis & {
  mongooseConnection?: CachedConnection;
};

const cached =
  globalForMongo.mongooseConnection ??
  (globalForMongo.mongooseConnection = { conn: null, promise: null });

export async function connectMongo() {
  // Reuse a live connection. readyState 1 = connected.
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        // Fail fast instead of hanging on the 30s default — a slow/overloaded
        // Atlas cluster surfaces an error in 10s rather than freezing the page.
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        // Keep at least one socket warm so we don't pay a full cold-connect
        // on every request after a short idle period.
        maxPoolSize: 10,
        minPoolSize: 1,
        // Force IPv4 — avoids slow IPv6 SRV/DNS resolution on Windows.
        family: 4,
      })
      .catch((error) => {
        // Don't cache a rejected promise: a single transient failure would
        // otherwise poison every later request until the server restarts.
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * lib/mongodb.ts
 *
 * Mongoose connection helper for Next.js (TypeScript).
 * - Uses a global cache to avoid creating multiple connections during development (hot reloads).
 * - Exposes a typed `connectToDatabase` function returning the Mongoose instance.
 * - Includes a `disconnectDatabase` helper useful for tests or graceful shutdown.
 */

import mongoose, { ConnectOptions, Mongoose } from 'mongoose';

// A small typed cache structure we attach to the global object in development
type MongooseCache = {
  conn: Mongoose | null; // cached Mongoose instance
  promise: Promise<Mongoose> | null; // pending connection promise
};

// Extend the global scope to store the cache across module reloads
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

// Initialize or reuse the global cache. This prevents opening multiple
// connections during Next.js hot-reloads in development mode.
const cache: MongooseCache = global._mongoose ?? (global._mongoose = { conn: null, promise: null });

/**
 * Connect to MongoDB using Mongoose.
 * Returns the Mongoose instance (typed) and caches it for subsequent calls.
 *
 * Throws a helpful error if `MONGODB_URI` is not set.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // If we've already connected, return the cached connection.
  if (cache.conn) {
    return cache.conn;
  }

  // Ensure the environment variable is present
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  // If a connection is already being established, wait for it.
  if (!cache.promise) {
    // The ConnectOptions type is provided by Mongoose and keeps our options typed.
    const opts: ConnectOptions = {
      // Note: modern Mongoose sets sensible defaults for these options.
      // Add driver-specific options here if needed (authSource, tls, replicaSet, etc.).
    };

    // Save the promise so concurrent calls will wait for the same connection.
    cache.promise = mongoose.connect(uri, opts).then((mongooseInstance) => mongooseInstance as Mongoose);
  }

  // Await the connection promise and store the resulting instance in the cache.
  cache.conn = await cache.promise;
  return cache.conn;
}

/**
 * Disconnect the Mongoose connection and clear the cache.
 * Useful for tests and server shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
}

export default connectToDatabase;

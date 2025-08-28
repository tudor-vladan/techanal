import { MiddlewareHandler } from 'hono';
import { verifyFirebaseToken } from '../lib/firebase-auth';
import { getDatabase } from '../lib/db';
import { eq } from 'drizzle-orm';
import { User, users } from '../schema/users';
import { getFirebaseProjectId, getDatabaseUrl } from '../lib/env';

declare module 'hono' {
  interface ContextVariableMap {
    user: User;
  }
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    let authHeader = c.req.header('Authorization');
    // Support token via query for SSE/EventSource where custom headers are hard
    if (!authHeader) {
      const url = new URL(c.req.url);
      const token = url.searchParams.get('token');
      if (token) {
        authHeader = `Bearer ${token}`;
      }
    }
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.split('Bearer ')[1];

    // Accept simple email-based tokens (useful in local/dev setups)
    if (token && token.includes('@')) {
      const email = token.trim();

      // Default in-memory user for dev (no DB requirement)
      const mockUser = {
        id: email as unknown as string,
        email,
        display_name: null,
        photo_url: null,
      } as User;

      try {
        // Try to persist/read user if database is available, but don't fail auth if it isn't
        const databaseUrl = getDatabaseUrl();
        const db = await getDatabase(databaseUrl);

        await db.insert(users)
          .values({
            id: email as unknown as string,
            email,
            display_name: null,
            photo_url: null,
          })
          .onConflictDoNothing();

        const [user] = await db.select()
          .from(users)
          .where(eq(users.id, email))
          .limit(1);

        c.set('user', user ?? mockUser);
      } catch (e) {
        console.warn('Dev auth: database unavailable, using in-memory user');
        c.set('user', mockUser);
      }

      await next();
      return;
    }

    // Otherwise: use Firebase authentication
    const firebaseProjectId = getFirebaseProjectId();
    const firebaseUser = await verifyFirebaseToken(token, firebaseProjectId);

    const databaseUrl = getDatabaseUrl();
    const db = await getDatabase(databaseUrl);

    // Upsert: insert if not exists, do nothing if exists
    await db.insert(users)
      .values({
        id: firebaseUser.id,
        email: firebaseUser.email!,
        display_name: null,
        photo_url: null,
      })
      .onConflictDoNothing();

    // Get the user (either just created or already existing)
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, firebaseUser.id))
      .limit(1);

    if (!user) {
      throw new Error('Failed to create or retrieve user');
    }

    c.set('user', user);
    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
}; 
import { db } from '@/server/db';
import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';

export async function createContext() {
  const session = await auth();

  return {
    db,
    session,
  };
}

export type Context = {
  db: typeof db;
  session: Session | null;
};

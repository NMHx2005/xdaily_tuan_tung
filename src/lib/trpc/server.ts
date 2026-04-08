import 'server-only';
import { appRouter } from '@/server/trpc';
import { createContext } from '@/server/trpc/context';

export async function createCaller() {
  const context = await createContext();
  return appRouter.createCaller(context);
}

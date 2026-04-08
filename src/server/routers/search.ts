import { router, publicProcedure } from '@/server/trpc/trpc';

export const searchRouter = router({
  global: publicProcedure.query(async () => {
    // TODO: implement
    return [];
  }),
});

import { router, publicProcedure, adminProcedure } from '@/server/trpc/trpc';

export const reviewRouter = router({
  getByProduct: publicProcedure.query(async () => {
    // TODO: implement
    return [];
  }),

  create: publicProcedure.mutation(async () => {
    // TODO: implement
    return null;
  }),

  delete: adminProcedure.mutation(async () => {
    // TODO: implement
    return null;
  }),
});

import { router, publicProcedure, protectedProcedure } from '@/server/trpc/trpc';

export const cartRouter = router({
  get: protectedProcedure.query(async () => {
    // TODO: implement
    return [];
  }),

  addItem: protectedProcedure.mutation(async () => {
    // TODO: implement
    return null;
  }),

  updateItem: protectedProcedure.mutation(async () => {
    // TODO: implement
    return null;
  }),

  removeItem: protectedProcedure.mutation(async () => {
    // TODO: implement
    return null;
  }),
});

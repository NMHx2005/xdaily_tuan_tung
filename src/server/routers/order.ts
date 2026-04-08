import { router, publicProcedure, protectedProcedure, adminProcedure } from '@/server/trpc/trpc';

export const orderRouter = router({
  create: publicProcedure.mutation(async () => {
    // TODO: implement
    return null;
  }),

  getById: protectedProcedure.query(async () => {
    // TODO: implement
    return null;
  }),

  getMyOrders: protectedProcedure.query(async () => {
    // TODO: implement
    return [];
  }),

  getAll: adminProcedure.query(async () => {
    // TODO: implement
    return [];
  }),

  updateStatus: adminProcedure.mutation(async () => {
    // TODO: implement
    return null;
  }),
});

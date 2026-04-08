import { router, protectedProcedure, adminProcedure } from '@/server/trpc/trpc';

export const userRouter = router({
  getProfile: protectedProcedure.query(async () => {
    // TODO: implement
    return null;
  }),

  updateProfile: protectedProcedure.mutation(async () => {
    // TODO: implement
    return null;
  }),

  getAll: adminProcedure.query(async () => {
    // TODO: implement
    return [];
  }),
});

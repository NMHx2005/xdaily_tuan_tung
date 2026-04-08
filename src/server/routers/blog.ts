import { router, publicProcedure, adminProcedure } from '@/server/trpc/trpc';

export const blogRouter = router({
  getAll: publicProcedure.query(async () => {
    // TODO: implement
    return [];
  }),

  getBySlug: publicProcedure.query(async () => {
    // TODO: implement
    return null;
  }),

  getRecent: publicProcedure.query(async () => {
    // TODO: implement
    return [];
  }),

  create: adminProcedure.mutation(async () => {
    // TODO: implement
    return null;
  }),

  update: adminProcedure.mutation(async () => {
    // TODO: implement
    return null;
  }),

  delete: adminProcedure.mutation(async () => {
    // TODO: implement
    return null;
  }),
});

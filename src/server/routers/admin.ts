import { router, adminProcedure } from '@/server/trpc/trpc';

export const adminRouter = router({
  getDashboardStats: adminProcedure.query(async () => {
    // TODO: implement
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
    };
  }),

  getRecentOrders: adminProcedure.query(async () => {
    // TODO: implement
    return [];
  }),
});

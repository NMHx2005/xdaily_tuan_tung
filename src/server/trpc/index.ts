import { router } from './trpc';
import { productRouter } from '@/server/routers/product';
import { collectionRouter } from '@/server/routers/collection';
import { cartRouter } from '@/server/routers/cart';
import { orderRouter } from '@/server/routers/order';
import { blogRouter } from '@/server/routers/blog';
import { reviewRouter } from '@/server/routers/review';
import { userRouter } from '@/server/routers/user';
import { searchRouter } from '@/server/routers/search';
import { adminRouter } from '@/server/routers/admin';
import { newsletterRouter } from '@/server/routers/newsletter';

export const appRouter = router({
  product: productRouter,
  collection: collectionRouter,
  cart: cartRouter,
  order: orderRouter,
  blog: blogRouter,
  review: reviewRouter,
  user: userRouter,
  search: searchRouter,
  admin: adminRouter,
  newsletter: newsletterRouter,
});

export type AppRouter = typeof appRouter;

import { router } from '@/server/api/trpc';
import { matchRouter } from '@/server/api/routers/match';

export const appRouter = router({
  match: matchRouter,
});

export type AppRouter = typeof appRouter;
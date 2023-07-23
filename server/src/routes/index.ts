import express from 'express';
import 'express-async-errors';
import authRoute from './auth.route';
import userRoute from './user.route';
import playgroundRouter from './playground.route';
const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/user',
    route: userRoute,
  },

  {
    path: '/playground',
    route: playgroundRouter,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;

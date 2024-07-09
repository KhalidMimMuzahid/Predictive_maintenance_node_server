import express, { Router } from 'express';
import { postRoutes } from './post/post.routes';

const router: Router = express.Router();

const subModuleRoutes: { path: string; route: express.Router }[] = [
  { path: '/post', route: postRoutes },
];

subModuleRoutes.forEach((route) => router.use(route.path, route.route));
export const feedRoutes = router;

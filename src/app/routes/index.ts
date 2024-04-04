/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';

const router = express.Router();

const moduleRoutes: any[] = [
  // { path: '/path_name', route: routes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;

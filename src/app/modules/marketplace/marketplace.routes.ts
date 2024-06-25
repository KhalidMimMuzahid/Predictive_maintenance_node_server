import express, { Router } from 'express';
import { productRoutes } from './product/product.routes';

const router: Router = express.Router();

const subModuleRoutes: { path: string; route: express.Router }[] = [
  { path: '/product', route: productRoutes },
];

subModuleRoutes.forEach((route) => router.use(route.path, route.route));
export const marketplaceRoutes = router;

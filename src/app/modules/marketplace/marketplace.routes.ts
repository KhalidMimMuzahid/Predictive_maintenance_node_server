import express, { Router } from 'express';
import { productRoutes } from './product/product.routes';
import { cartRoutes } from './cart/cart.routes';

const router: Router = express.Router();

const subModuleRoutes: { path: string; route: express.Router }[] = [
  { path: '/product', route: productRoutes },
  { path: '/cart', route: cartRoutes },
];

subModuleRoutes.forEach((route) => router.use(route.path, route.route));
export const marketplaceRoutes = router;

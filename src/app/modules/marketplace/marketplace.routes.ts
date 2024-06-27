import express, { Router } from 'express';
import { productRoutes } from './product/product.routes';
import { cartRoutes } from './cart/cart.routes';
import { orderRoutes } from './order/order.routes';
import { shopRoutes } from './shop/shop.routes';

const router: Router = express.Router();

const subModuleRoutes: { path: string; route: express.Router }[] = [
  { path: '/product', route: productRoutes },
  { path: '/cart', route: cartRoutes },
  { path: '/order', route: orderRoutes },
  { path: '/shop', route: shopRoutes },
];

subModuleRoutes.forEach((route) => router.use(route.path, route.route));
export const marketplaceRoutes = router;

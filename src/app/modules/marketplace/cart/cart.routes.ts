import express, { Router } from 'express';
import { cartController } from './cart.controller';

const router: Router = express.Router();

router.post('/add-product', cartController.addProductToCart);

export const cartRoutes = router;

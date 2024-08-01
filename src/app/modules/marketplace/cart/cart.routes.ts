import express, { Router } from 'express';
import { cartController } from './cart.controller';

const router: Router = express.Router();

router.post('/add-product', cartController.addProductToCart);
router.delete('/delete-cart', cartController.deleteCart);
router.get('/get-my-all-carts', cartController.getMyAllCarts);
export const cartRoutes = router;

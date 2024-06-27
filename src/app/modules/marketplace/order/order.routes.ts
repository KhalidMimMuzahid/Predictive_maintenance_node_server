import express, { Router } from 'express';
import { orderController } from './order.controller';

const router: Router = express.Router();

router.post('/order-product', orderController.orderProduct);

export const orderRoutes = router;

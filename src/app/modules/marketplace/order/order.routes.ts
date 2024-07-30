import express, { Router } from 'express';
import { orderController } from './order.controller';

const router: Router = express.Router();

router.post('/order-product', orderController.orderProduct);
router.get('/get-my-all-order', orderController.getMyAllOrder);
router.get(
  '/get-order-details-by-order',
  orderController.getOrderDetailsByOrder,
);


export const orderRoutes = router;

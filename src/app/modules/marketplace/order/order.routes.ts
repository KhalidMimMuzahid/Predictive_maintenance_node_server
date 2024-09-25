import express, { Router } from 'express';
import validateRequest from '../../../middlewares/validateRequest';
import { orderController } from './order.controller';
import { orderValidation } from './order.validation';

const router: Router = express.Router();

router.post(
  '/order-product',
  validateRequest(orderValidation.orderValidationSchema),
  orderController.orderProduct,
);

router.patch('/cancel-or-accept-order', orderController.cancelOrAcceptOrder);
router.patch(
  '/change-status-with-date',

  validateRequest(orderValidation.changeStatusValidationSchema),
  orderController.changeStatusWithDate,
);

router.get('/get-my-all-order', orderController.getMyAllOrder);
router.get(
  '/get-order-details-by-order',
  orderController.getOrderDetailsByOrder,
);
router.get('/get-all-orders-by-shop', orderController.getAllOrdersByShop);
router.get('/get-all-orders', orderController.getAllOrders);

export const orderRoutes = router;

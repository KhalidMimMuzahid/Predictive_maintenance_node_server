import express, { Router } from 'express';
import validateRequest from '../../../middlewares/validateRequest';
import { shopController } from './shop.controller';
import { shopValidation } from './shop.validation';

const router: Router = express.Router();

router.post(
  '/create',
  validateRequest(shopValidation.createShopValidationSchema),
  shopController.createShop,
);
router.get('/get-shop-dashboard', shopController.getShopDashboard);
router.get(
  '/get-product-sales-for-graph',
  shopController.getProductSalesForGraph,
);

export const shopRoutes = router;

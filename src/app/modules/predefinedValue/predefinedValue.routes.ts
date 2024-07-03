import express, { Router } from 'express';
import { predefinedValueController } from './predefinedValue.controller';

const router: Router = express.Router();

router.post(
  '/add-product-categories',
  predefinedValueController.addProductCategories,
);
router.post(
  '/add-product-sub-categories',
  predefinedValueController.addProductSubCategories,
);
router.post(
  '/add-shop-categories',
  predefinedValueController.addShopCategories,
);
export const predefinedValueRoutes = router;

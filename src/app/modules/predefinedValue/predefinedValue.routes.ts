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
router.post(
  '/add-iot-section-name',
  predefinedValueController.addIotSectionName,
);



router.get(
  '/get-product-categories',
  predefinedValueController.getProductCategories,
);

router.get('/get-shop-categories', predefinedValueController.getShopCategories);
router.get(
  '/get-iot-section-names',
  predefinedValueController.getIotSectionNames,
);
export const predefinedValueRoutes = router;

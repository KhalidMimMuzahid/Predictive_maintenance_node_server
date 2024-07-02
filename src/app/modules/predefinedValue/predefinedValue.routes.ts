import express, { Router } from 'express';
import { predefinedValueController } from './predefinedValue.controller';

const router: Router = express.Router();

router.post(
  '/add-product-categories',
  predefinedValueController.addProductCategories,
);
export const predefinedValueRoutes = router;

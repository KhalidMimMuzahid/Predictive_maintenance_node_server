import express, { Router } from 'express';
import { productController } from './product.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { productValidation } from './product.validation';

const router: Router = express.Router();

router.post(
  '/create',
  validateRequest(productValidation.createProductValidationSchema),
  productController.createProduct,
);
router.get('/get-all-products', productController.getAllProducts);

export const productRoutes = router;

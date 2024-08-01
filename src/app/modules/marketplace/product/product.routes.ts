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
router.post(
  '/add-review',
  validateRequest(productValidation.reviewValidationSchema),
  productController.addReview,
);
router.get('/get-all-products', productController.getAllProducts);
router.get(
  '/get-all-products-count-category-wise',
  productController.getAllProductsCategoryWise,
);

export const productRoutes = router;
//
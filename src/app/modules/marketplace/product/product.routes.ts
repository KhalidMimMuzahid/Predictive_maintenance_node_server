import express, { Router } from 'express';
import validateRequest from '../../../middlewares/validateRequest';
import { productController } from './product.controller';
import { productValidation } from './product.validation';

const router: Router = express.Router();

router.post(
  '/create',
  validateRequest(productValidation.createProductValidationSchema),
  productController.createProduct,
);
router.post(
  '/edit',
  validateRequest(productValidation.editProductValidationSchema),
  productController.editProduct,
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
router.get(
  '/get-all-products-by-shop-dashboard',
  productController.getAllProductsByShopDashboard,
);
router.get('/get-all-products-by-shop', productController.getAllProductsByShop);

router.get(
  '/get-product-by-product_id',
  productController.getProductByProduct_id,
);
router.get('/get-top-sales-product', productController.getTopSalesProducts);

export const productRoutes = router;
//

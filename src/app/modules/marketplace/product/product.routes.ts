import express, { Router } from 'express';
import { productController } from './product.controller';

const router: Router = express.Router();

router.post(
  '/create',
  //   validateRequest(reservationValidation.createReservationValidationSchema),
  productController.createProduct,
);

export const productRoutes = router;

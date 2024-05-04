import express, { Router } from 'express';
import { invoiceController } from './invoice.controller';
import validateRequest from '../../middlewares/validateRequest';
import { invoiceValidation } from './invoice.validation';
const router: Router = express.Router();

router.patch(
  '/add-additional-products',

  validateRequest(invoiceValidation.addAdditionalProductValidationSchema),
  invoiceController.addAdditionalProducts,
);

export const invoiceRoutes = router;

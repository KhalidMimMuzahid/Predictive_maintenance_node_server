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
router.get('/get-all-invoices', invoiceController.getAllInvoices);
router.get('/get-all-invoices-by-user', invoiceController.getAllInvoicesByUser);
router.patch(
  '/change-status-to-completed',
  invoiceController.changeStatusToCompleted,
);

export const invoiceRoutes = router;

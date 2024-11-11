import express, { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { invoiceController } from './invoice.controller';
import { invoiceValidation } from './invoice.validation';
const router: Router = express.Router();

router.patch(
  '/add-additional-products',

  validateRequest(invoiceValidation.addAdditionalProductValidationSchema),
  invoiceController.addAdditionalProducts,
);
router.patch('/start-inspection', invoiceController.startInspection);
router.patch(
  '/inspection-report',
  validateRequest(invoiceValidation.inspectionReport),
  invoiceController.inspectionReport,
);
router.patch(
  '/inspection',
  validateRequest(invoiceValidation.inspectionValidationSchema),
  invoiceController.inspection,
);
router.get('/get-all-invoices', invoiceController.getAllInvoices);
router.get('/get-all-invoices-by-user', invoiceController.getAllInvoicesByUser);
router.get(
  '/get-all-assigned-tasks-by-engineer',
  invoiceController.getAllAssignedTasksByEngineer,
);
router.patch(
  '/change-status-to-completed',
  invoiceController.changeStatusToCompleted,
);

router.get('/get-today-tasks-summary', invoiceController.getTodayTasksSummary);

export const invoiceRoutes = router;

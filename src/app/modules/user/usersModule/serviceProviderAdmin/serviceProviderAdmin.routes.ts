import express, { Router } from 'express';
import { serviceProviderAdminControllers } from './serviceProviderAdmin.controller';
import validateRequest from '../../../../middlewares/validateRequest';
import { serviceProviderAdminValidation } from './serviceProviderAdmin.validation';

const router: Router = express.Router();
router.post(
  '/sign-up',
  validateRequest(serviceProviderAdminValidation.userCreateValidationSchema),
  serviceProviderAdminControllers.createServiceProviderAdmin,
);
router.patch(
  '/add-branch',
  validateRequest(serviceProviderAdminValidation.addBranchValidationSchema),
  serviceProviderAdminControllers.addServiceProviderBranch,
);
export const serviceProviderAdminRoutes = router;

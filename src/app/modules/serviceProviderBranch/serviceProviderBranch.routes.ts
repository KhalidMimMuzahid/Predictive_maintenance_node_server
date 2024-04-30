import express, { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { serviceProviderBranchValidation } from './serviceProviderBranch.validation';
import { serviceProviderBranchController } from './serviceProviderBranch.controller';

const router: Router = express.Router();
router.post(
  '/create',
  validateRequest(
    serviceProviderBranchValidation.ServiceProviderBranchCreateValidationSchema,
  ),
  serviceProviderBranchController.createServiceProviderBranch,
);
export const serviceProviderBranchRoutes = router;

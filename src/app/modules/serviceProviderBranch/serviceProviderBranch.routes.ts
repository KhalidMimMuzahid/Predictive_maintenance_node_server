import express, { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { serviceProviderBranchValidation } from './serviceProviderBranch.validation';
import { serviceProviderBranchController } from './serviceProviderBranch.controller';
import { updateAddressValidationSchema } from '../common/common.validation';

const router: Router = express.Router();
router.post(
  '/create',
  validateRequest(
    serviceProviderBranchValidation.ServiceProviderBranchCreateValidationSchema,
  ),
  serviceProviderBranchController.createServiceProviderBranch,
);
router.patch(
  '/update-address',
  validateRequest(updateAddressValidationSchema),
  serviceProviderBranchController.updateAddress,
);

export const serviceProviderBranchRoutes = router;

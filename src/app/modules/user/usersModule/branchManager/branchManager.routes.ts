import express, { Router } from 'express';
import { serviceProviderBranchManagerControllers } from './branchManager.controller';
import validateRequest from '../../../../middlewares/validateRequest';
import { serviceProviderBranchManagerValidation } from './branchManager.validation';

const router: Router = express.Router();
router.post(
  '/sign-up',
  validateRequest(
    serviceProviderBranchManagerValidation.userCreateValidationSchema,
  ),
  serviceProviderBranchManagerControllers.createServiceProviderBranchManager,
);
// router.get('/sign-in', serviceProviderAdminControllers.signIn);
export const serviceProviderBranchManagerRoutes = router;

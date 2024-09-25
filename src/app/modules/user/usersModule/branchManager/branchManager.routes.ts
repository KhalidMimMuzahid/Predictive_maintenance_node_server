import express, { Router } from 'express';
import validateRequest from '../../../../middlewares/validateRequest';
import { serviceProviderBranchManagerControllers } from './branchManager.controller';
import { serviceProviderBranchManagerValidation } from './branchManager.validation';

const router: Router = express.Router();
router.post(
  '/sign-up',
  validateRequest(
    serviceProviderBranchManagerValidation.userCreateValidationSchema,
  ),
  serviceProviderBranchManagerControllers.createServiceProviderBranchManager,
);

router.patch(
  '/approve-and-assign-into-branch',
  serviceProviderBranchManagerControllers.approveAndAssignBranchManagerInToBranch,
);

router.patch(
  '/edit-service-provider-branch-manager',
  serviceProviderBranchManagerControllers.editServiceProviderBranchManager,
);
export const serviceProviderBranchManagerRoutes = router;

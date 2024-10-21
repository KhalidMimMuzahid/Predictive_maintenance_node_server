import express, { Router } from 'express';
import validateRequest from '../../../../middlewares/validateRequest';
import { serviceProviderEngineerControllers } from './serviceProviderEngineer.controller';
import { serviceProviderEngineerValidation } from './serviceProviderEngineer.validation';

const router: Router = express.Router();
router.post(
  '/sign-up',
  validateRequest(serviceProviderEngineerValidation.userCreateValidationSchema),
  serviceProviderEngineerControllers.createServiceProviderEngineer,
);
router.patch(
  '/approve-and-assign-into-branch',
  serviceProviderEngineerControllers.approveAndAssignEngineerInToBranch,
);

router.patch(
  '/edit-service-provider-engineer',
  serviceProviderEngineerControllers.editServiceProviderEngineer,
);
router.get(
  '/get-all-service-provider-engineers-by-branch',
  serviceProviderEngineerControllers.getAllServiceProviderEngineersByBranch,
);
export const serviceProviderEngineerRoutes = router;

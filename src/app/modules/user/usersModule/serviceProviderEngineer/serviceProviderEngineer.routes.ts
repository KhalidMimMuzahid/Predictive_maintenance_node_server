import express, { Router } from 'express';
import { serviceProviderEngineerControllers } from './serviceProviderEngineer.controller';
import validateRequest from '../../../../middlewares/validateRequest';
import { serviceProviderEngineerValidation } from './serviceProviderEngineer.validation';

const router: Router = express.Router();
router.post(
  '/sign-up',
  validateRequest(serviceProviderEngineerValidation.userCreateValidationSchema),
  serviceProviderEngineerControllers.createServiceProviderEngineer,
);
// router.get('/sign-in', serviceProviderAdminControllers.signIn);
export const serviceProviderEngineerRoutes = router;

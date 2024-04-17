import express, { Router } from 'express';
import { serviceProviderAdminControllers } from './serviceProviderAdmin.controller';

const router: Router = express.Router();
router.post(
  '/sign-up',
  //   validateRequest(showaUserValidation.userCreateValidationSchema),
  serviceProviderAdminControllers.createServiceProviderAdmin,
);
// router.get('/sign-in', showaUserControllers.signIn);
export const adminRoutes = router;

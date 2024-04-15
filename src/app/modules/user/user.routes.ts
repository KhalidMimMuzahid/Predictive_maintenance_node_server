import express, { Router } from 'express';
import { userControllers } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { userValidation } from './user.validation';
import { adminRoutes } from './usersModule/serviceProviderAdmin/serviceProviderAdmin.routes';

const router: Router = express.Router();

// Start ------------------------------- XXXXX ----------------------------
// those routers are for special user role routes
// router.use("/engineer", engineerRoutes)
// router.use("/branch-manager", branchManagerRoutes)

const subModuleRoutes: { path: string; route: express.Router }[] = [
  { path: '/service-provider-admin', route: adminRoutes },
];

subModuleRoutes.forEach((route) => router.use(route.path, route.route));
// etc etc etc
// End --------------------------------- XXXXX ----------------------------

// Start ------------------------------- XXXXX ----------------------------
// those routers are for root user role routes
router.post(
  '/signup',
  validateRequest(userValidation.userCreateValidationSchema),
  userControllers.createUser,
);
// End --------------------------------- XXXXX ----------------------------
export const userRoutes = router;

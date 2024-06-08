import express, { Router } from 'express';

import { showaUserRoutes } from './usersModule/showaUsers/showaUser.routes';
import { userControllers } from './user.controller';
import { serviceProviderAdminRoutes } from './usersModule/serviceProviderAdmin/serviceProviderAdmin.routes';
import { serviceProviderEngineerRoutes } from './usersModule/serviceProviderEngineer/serviceProviderEngineer.routes';
import { serviceProviderBranchManagerRoutes } from './usersModule/branchManager/branchManager.routes';

const router: Router = express.Router();

// Start ------------------------------- XXXXX ----------------------------
// those routers are for special user role routes
const subModuleRoutes: { path: string; route: express.Router }[] = [
  { path: '/showa-user', route: showaUserRoutes },
  { path: '/service-provider-admin', route: serviceProviderAdminRoutes },
  { path: '/service-provider-engineer', route: serviceProviderEngineerRoutes },
  {
    path: '/service-provider-branch-manager',
    route: serviceProviderBranchManagerRoutes,
  },
];

subModuleRoutes.forEach((route) => router.use(route.path, route.route));
// End --------------------------------- XXXXX ----------------------------

// Start ------------------------------- XXXXX ----------------------------
// those routers are for root user routes
// router.post(
//   '/create-showa-user',
//   validateRequest(userValidation.userCreateValidationSchema),
//   userControllers.createUser,
// );
router.get('/sign-in', userControllers.signIn);
router.get('/get-user', userControllers.getUserBy_id);
router.post(
  '/get-users-info-by-users-array',
  userControllers.getUsersInfoByUsersArray,
);
router.get('/get-user-wallet-info', userControllers.getUserWalletInfo);
router.get('/get-all-showa-customers', userControllers.getAllShowaCustomers);
// End --------------------------------- XXXXX ----------------------------
export const userRoutes = router;

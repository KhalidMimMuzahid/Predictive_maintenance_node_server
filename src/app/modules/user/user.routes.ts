import express, { Router } from 'express';
import { adminRoutes } from './usersModule/serviceProviderAdmin/serviceProviderAdmin.routes';
import { showaUserRoutes } from './usersModule/showaUsers/showaUser.routes';
import { userControllers } from './user.controller';

const router: Router = express.Router();

// Start ------------------------------- XXXXX ----------------------------
// those routers are for special user role routes
const subModuleRoutes: { path: string; route: express.Router }[] = [
  { path: '/showa-user', route: showaUserRoutes },
  { path: '/service-provider-admin', route: adminRoutes },
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
router.get('/get-user', userControllers.getUserBy_id);
// End --------------------------------- XXXXX ----------------------------
export const userRoutes = router;

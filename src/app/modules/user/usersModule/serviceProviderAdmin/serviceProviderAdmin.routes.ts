import express, { Router } from 'express';

const router: Router = express.Router();

// Start ------------------------------- XXXXX ----------------------------
// those routers are for special user role routes
// router.use("/engineer", engineerRoutes)
// router.use("/branch-manager", branchManagerRoutes)
// etc etc etc
// End --------------------------------- XXXXX ----------------------------

// Start ------------------------------- XXXXX ----------------------------
// those routers are for root user role routes
// router.post(
//   '/signup',
//   validateRequest(userValidation.userCreateValidationSchema),
//   userControllers.createUser,
// );
// End --------------------------------- XXXXX ----------------------------
export const adminRoutes = router;

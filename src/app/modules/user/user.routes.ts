import express, { Router } from 'express';
import { userControllers } from './user.controller';

const router: Router = express.Router();

// Start ------------------------------- XXXXX ----------------------------
// those routers are for special user role routes
// router.use("/engineer", engineerRoutes)
// router.use("/branch-manager", branchManagerRoutes)
// etc etc etc
// End --------------------------------- XXXXX ----------------------------

// Start ------------------------------- XXXXX ----------------------------
// those routers are for root user role routes
router.post('/signup', userControllers.createUser);
// End --------------------------------- XXXXX ----------------------------
export const userRoutes = router;

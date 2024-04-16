import express, { Router } from 'express';
import { machineController } from './machine.controller';

const router: Router = express.Router();

// Start ------------------------------- XXXXX ----------------------------
// those routers are for special user role routes
// router.use("/engineer", engineerRoutes)
// router.use("/branch-manager", branchManagerRoutes)
// etc etc etc
// End --------------------------------- XXXXX ----------------------------

// Start ------------------------------- XXXXX ----------------------------
// those routers are for root user role routes
router.post('/washing', machineController.createWashingMachine);
router.get('/:uid', machineController.getMyReservations);
router.get('/status/:uid/:status', machineController.getMyReservationsByStatus);
router.get('/status/:status', machineController.getReservationsByStatus);
// End --------------------------------- XXXXX ----------------------------
export const reservationRoutes = router;
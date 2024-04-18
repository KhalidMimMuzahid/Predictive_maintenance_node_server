import express, { Router } from 'express';
import { reservationController } from './reservation.controller';

const router: Router = express.Router();

// Start ------------------------------- XXXXX ----------------------------
// those routers are for special user role routes
// router.use("/engineer", engineerRoutes)
// router.use("/branch-manager", branchManagerRoutes)
// etc etc etc
// End --------------------------------- XXXXX ----------------------------

// Start ------------------------------- XXXXX ----------------------------
// those routers are for root user role routes
router.post('/', reservationController.createReservationRequest);
router.get('/', reservationController.getMyReservations);
router.get('/status/:status', reservationController.getMyReservationsByStatus);
router.get('/status/:status', reservationController.getReservationsByStatus);
// End --------------------------------- XXXXX ----------------------------
export const reservationRoutes = router;

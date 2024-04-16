import express, { Router } from 'express';
import { reservationGroupController } from './reservationGroup.controller';

const router: Router = express.Router();

// Start ------------------------------- XXXXX ----------------------------
// those routers are for special user role routes
// router.use("/engineer", engineerRoutes)
// router.use("/branch-manager", branchManagerRoutes)
// etc etc etc
// End --------------------------------- XXXXX ----------------------------

// Start ------------------------------- XXXXX ----------------------------
// those routers are for root user role routes
router.post('/', reservationGroupController.createReservationGroup);
router.post('/add-bid', reservationGroupController.addBid);
// router.get('/:uid', reservationController.getMyReservations);
// router.get('/status/:uid/:status', reservationController.getMyReservationsByStatus);
// router.get('/status/:status', reservationController.getReservationsByStatus);
// End --------------------------------- XXXXX ----------------------------
export const reservationGroupRoutes = router;

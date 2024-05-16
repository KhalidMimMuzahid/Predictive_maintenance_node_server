import express, { Router } from 'express';
import { reservationGroupController } from './reservationGroup.controller';
import validateRequest from '../../middlewares/validateRequest';
import { reservationGroupValidation } from './reservationGroup.validation';

const router: Router = express.Router();

// Start ------------------------------- XXXXX ----------------------------
// those routers are for special user role routes
// router.use("/engineer", engineerRoutes)
// router.use("/branch-manager", branchManagerRoutes)
// etc etc etc
// End --------------------------------- XXXXX ----------------------------

// Start ------------------------------- XXXXX ----------------------------
// those routers are for root user role routes
router.post(
  '/create',

  validateRequest(reservationGroupValidation.createReservationGroupSchema),
  reservationGroupController.createReservationGroup,
);
router.get(
  '/all-reservations-group',
  reservationGroupController.allReservationsGroup,
);
router.patch(
  '/add-bid',
  validateRequest(reservationGroupValidation.addBidSchema),
  reservationGroupController.addBid,
);
router.patch(
  '/select-bidding-winner',
  reservationGroupController.selectBiddingWinner,
);
router.patch(
  '/send-reservation-group-to-branch',
  reservationGroupController.sendReservationGroupToBranch,
);
router.post(
  '/assign-reservation-group-to-team',
  reservationGroupController.sendReservationGroupToBranch,
);
router.get(
  '/get-invoice-group-by-id',
  reservationGroupController.getReservationGroupById,
);



// router.get('/:uid', reservationController.getMyReservations);
// router.get('/status/:uid/:status', reservationController.getMyReservationsByStatus);
// router.get('/status/:status', reservationController.getReservationsByStatus);
// End --------------------------------- XXXXX ----------------------------
export const reservationGroupRoutes = router;

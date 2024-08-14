import express, { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { reservationGroupController } from './reservationGroup.controller';
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
  '/set-bidding-date',
  validateRequest(reservationGroupValidation.setBiddingDateSchema),
  reservationGroupController.setBiddingDate,
);
router.patch(
  '/select-bidding-winner',
  reservationGroupController.selectBiddingWinner,
);
router.patch(
  '/send-reservation-group-to-branch',
  reservationGroupController.sendReservationGroupToBranch,
);
router.patch(
  '/accept-on-demand-res-group-by-company',
  reservationGroupController.acceptOnDemandResGroupByCompany,
);

router.post(
  '/assign-reservation-group-to-team',
  reservationGroupController.sendReservationGroupToBranch,
);
router.get(
  '/get-reservation-group-by-id',
  reservationGroupController.getReservationGroupById,
);

router.get(
  '/get-live-reservation-groups',
  reservationGroupController.getLiveReservationGroups,
);

router.patch('/update-bid', reservationGroupController.updateBid);

router.delete('/delete-bid', reservationGroupController.deleteBid);

router.get(
  '/get-bided-reservation-groups-by-company',
  reservationGroupController.getBidedReservationGroupsByCompany,
);
router.get(
  '/get-all-un-assigned-res-group-to-branch-by-company',
  reservationGroupController.getAllUnAssignedResGroupToBranchByCompany,
);
router.get(
  '/get-all-on-demand-res-group-by-company',
  reservationGroupController.getAllOnDemandResGroupByCompany,
);
router.get(
  '/get-all-on-demand-unassigned-to-company-res-groups',
  reservationGroupController.getAllOnDemandUnassignedToCompanyResGroups,
);

//router.get('/get-recent-bid', reservationGroupController.getRecentBid);

// router.get('/:uid', reservationController.getMyReservations);
// router.get('/status/:uid/:status', reservationController.getMyReservationsByStatus);
// router.get('/status/:status', reservationController.getReservationsByStatus);
// End --------------------------------- XXXXX ----------------------------
export const reservationGroupRoutes = router;

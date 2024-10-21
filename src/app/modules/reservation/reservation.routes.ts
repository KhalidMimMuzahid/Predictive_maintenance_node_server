import express, { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { reservationController } from './reservation.controller';
import { reservationValidation } from './reservation.validation';

const router: Router = express.Router();

router.post(
  '/create',
  validateRequest(reservationValidation.createReservationValidationSchema),
  reservationController.createReservationRequest,
);

router.patch(
  '/set-reservation-as-invalid',
  reservationController.setReservationAsInvalid,
);
router.patch(
  '/reschedule',
  validateRequest(reservationValidation.rescheduleSchema),
  reservationController.reschedule,
);

router.get('/', reservationController.getMyReservations);
router.get('/all-reservation', reservationController.getAllReservations);
router.get(
  '/all-reservation-count',
  reservationController.getAllReservationsCount,
);
router.get(
  '/all-reservation-by-user',
  reservationController.getAllReservationsByUser,
);
router.get(
  '/all-reservation-by-service-provider-company',
  reservationController.getAllReservationsByServiceProviderCompany,
);

router.get(
  '/all-scheduled-reservation-by-service-provider-company',
  reservationController.getAllScheduledReservationsByServiceProviderCompany,
);
router.get(
  '/get-reservation-count-by-service-provider-company',
  reservationController.getReservationCountByServiceProviderCompany,
);
router.get('/status', reservationController.getMyReservationsByStatus);
router.get('/status/:status', reservationController.getReservationsByStatus);
router.post('/upload-image', reservationController.uploadRequestImage);
router.delete('/delete', reservationController.deleteReservation);

// type wise :'ongoing','completed','canceled','rescheduled'
router.get(
  '/get-reservation-request-for-service-provider-company',
  reservationController.getReservationRequestForServiceProviderCompany,
);

router.get(
  '/get-dashboard-screen-analyzing-for-service-provider-company',
  reservationController.getDashboardScreenAnalyzingForServiceProviderCompany,
);

router.get(
  '/get-completed-reservation-request-for-service-provider-company',
  reservationController.getCompletedReservationRequestForServiceProviderCompany,
);

router.get(
  '/get-chart-for-reservation-by-service-provider-company',
  reservationController.getChartAnalyzing,
);

router.get(
  '/get-total-reservation-for-chart',
  reservationController.getTotalReservationForChart,
);

router.get(
  '/generate-progress-reservation-in-percentage',
  reservationController.generateProgressReservationInPercentage,
);

router.get(
  '/get-reservation-request-by-reservation-id',
  reservationController.getReservationRequestByReservationId,
);

router.get(
  '/get-all-ongoing-reservation-by-branch',
  reservationController.getAllOngoingResByBranch,
);
router.get(
  '/get-all-rescheduled-reservation-by-branch',
  reservationController.getAllRescheduledResByBranch,
);
router.get(
  '/get-all-completed-reservation-by-branch',
  reservationController.getAllCompletedResByBranch,
);

export const reservationRoutes = router;

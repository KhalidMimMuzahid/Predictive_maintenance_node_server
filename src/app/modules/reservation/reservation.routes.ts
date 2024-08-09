import express, { Router } from 'express';
import { reservationController } from './reservation.controller';
import validateRequest from '../../middlewares/validateRequest';
import { reservationValidation } from './reservation.validation';

const router: Router = express.Router();

router.post(
  '/create',
  validateRequest(reservationValidation.createReservationValidationSchema),
  reservationController.createReservationRequest,
);
router.get('/', reservationController.getMyReservations);
router.get('/all-reservation', reservationController.getAllReservations);
router.get('/all-reservation-count', reservationController.getAllReservationsCount);
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
export const reservationRoutes = router;

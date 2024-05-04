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
router.get('/user', reservationController.getMyReservations);
router.get('/status/user', reservationController.getMyReservationsByStatus);
router.get('/status/:status', reservationController.getReservationsByStatus);
router.post('/upload-image', reservationController.uploadRequestImage);
export const reservationRoutes = router;

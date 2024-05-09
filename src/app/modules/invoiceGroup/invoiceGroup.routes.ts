import express, { Router } from 'express';
import { invoiceGroupController } from './invoiceGroup.controller';
const router: Router = express.Router();

router.post(
  '/assign-reservation-group-to-team',
  invoiceGroupController.assignReservationGroupToTeam,
);


export const invoiceGroupRoutes = router;

/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { reservationRoutes } from '../modules/reservation/reservation.routes'
import { reservationGroupRoutes } from '../modules/reservationGroup/reservationGroup.routes'
import { serviceProviderCompanyRoutes } from '../modules/serviceProviderCompany/serviceProviderCompany.routes';

const router = express.Router();

const moduleRoutes: any[] = [
  { path: '/user', route: userRoutes },
  { path: '/reservation', route: reservationRoutes },
  { path: '/reservations-group', route: reservationGroupRoutes },
  { path: '/service-provider-company', route: serviceProviderCompanyRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;

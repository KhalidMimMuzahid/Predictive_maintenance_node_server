/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { reservationRoutes } from '../modules/reservation/reservation.routes'

const router = express.Router();

const moduleRoutes: any[] = [
  { path: '/user', route: userRoutes },
  { path: '/reservation', route: reservationRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;

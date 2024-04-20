import express, { Router } from 'express';
import { sensorModuleAttachedControllers } from './sensorModuleAttached.controller';

const router: Router = express.Router();

router.post(
  '/add-sensor-module-attached',
  sensorModuleAttachedControllers.addSensorAttachedModule,
);
export const sensorModuleAttachedRoutes = router;

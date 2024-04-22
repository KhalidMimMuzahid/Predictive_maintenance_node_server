import express, { Router } from 'express';
import { sensorModuleAttachedControllers } from './sensorModuleAttached.controller';
import validateRequest from '../../middlewares/validateRequest';
import { sensorModuleAttachedValidation } from './sensorModuleAttached.validation';

const router: Router = express.Router();

router.post(
  '/add-sensor-module-attached',
  validateRequest(
    sensorModuleAttachedValidation.createSensorModuleAttachedSchema,
  ),
  sensorModuleAttachedControllers.addSensorAttachedModule,
);

export const sensorModuleAttachedRoutes = router;

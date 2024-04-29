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

router.get(
  '/get-sensors-by-user',
  sensorModuleAttachedControllers.getAttachedSensorModulesByUser,
);
// router.patch(
//   '/add-sensor-data',
//   // validateRequest(
//   //   sensorModuleAttachedValidation.createSensorModuleAttachedSchema,
//   // ),
//   sensorModuleAttachedControllers.addSensorData,
// );

export const sensorModuleAttachedRoutes = router;

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
router.patch('/add-sensor-data', sensorModuleAttachedControllers.addSensorData);

router.get(
  '/get-sensors-by-user',
  sensorModuleAttachedControllers.getAttachedSensorModulesByUser,
);

router.get(
  '/get-sensors-by-machine',
  sensorModuleAttachedControllers.getAttachedSensorModulesByMachine,
);
// router.patch(
//   '/add-sensor-data',
//   // validateRequest(
//   //   sensorModuleAttachedValidation.createSensorModuleAttachedSchema,
//   // ),
//   sensorModuleAttachedControllers.addSensorData,
// );

router.get('/get-sensor-data', sensorModuleAttachedControllers.getSensorData);
export const sensorModuleAttachedRoutes = router;

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

// relocated-to-another-server
// this endpoint is not used in this server
router.patch('/add-sensor-data-relocated-to-another-server', sensorModuleAttachedControllers.addSensorData);

router.get(
  '/get-sensors-by-user',
  sensorModuleAttachedControllers.getAttachedSensorModulesByUser,
);

router.get(
  '/get-sensors-by-machine',
  sensorModuleAttachedControllers.getAttachedSensorModulesByMachine,
);
router.get(
  '/get-all-sensors-by-machine',
  sensorModuleAttachedControllers.getAllAttachedSensorModulesByMachine,
);

router.get(
  '/get-sensor-module-attached-by-mac-address',
  sensorModuleAttachedControllers.getSensorModuleAttachedByMacAddress,
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

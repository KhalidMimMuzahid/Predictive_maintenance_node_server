import express, { Router } from 'express';
import { sensorModuleAttachedControllers } from './sensorModuleAttached.controller';

const router: Router = express.Router();

router.post(
  '/add-sensor-module-attached',
  // validateRequest(
  //   sensorModuleAttachedValidation.createSensorModuleAttachedSchema,
  // ),
  sensorModuleAttachedControllers.addSensorAttachedModule,
);

// -relocated-to-another-server
// this endpoint is not used in this server
router.patch(
  '/add-sensor-data-relocated-to-another-server',
  sensorModuleAttachedControllers.addSensorData,
);
router.patch(
  '/toggle-switch-sensor-module-attached',
  sensorModuleAttachedControllers.toggleSwitchSensorModuleAttached,
);

router.get(
  '/get-sensor-module-attached-by-user',
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
// this endpoint is not used in this server
// -relocated-to-another-server
router.get(
  '/get-sensor-data-by-category-type-brand-model-wise-relocated-to-another-server',
  sensorModuleAttachedControllers.getSensorDataByCategoryTypeBrandModelWise,
);
export const sensorModuleAttachedRoutes = router;

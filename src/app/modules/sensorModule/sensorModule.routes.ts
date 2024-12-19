import express, { Router } from 'express';
import { sensorModuleControllers } from './sensorModule.controller';

const router: Router = express.Router();

router.post('/add-sensor-module', sensorModuleControllers.addSensorModule);
router.post('/edit-sensor-module', sensorModuleControllers.editSensorModule);
router.get(
  '/get-all-sensor-module',
  sensorModuleControllers.getAllSensorModules,
);
router.get(
  '/get-sensor-module-by-mac-address',
  sensorModuleControllers.getSensorModuleByMacAddress,
);
router.delete(
  '/delete-sensor-module',
  sensorModuleControllers.deleteSensorModule,
);
export const sensorModuleRoutes = router;

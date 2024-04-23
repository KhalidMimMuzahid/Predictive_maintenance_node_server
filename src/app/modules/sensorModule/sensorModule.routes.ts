import express, { Router } from 'express';
import { sensorModuleControllers } from './sensorModule.controller';

const router: Router = express.Router();

router.post('/add-sensor-module', sensorModuleControllers.addSensorModule);
export const sensorModuleRoutes = router;

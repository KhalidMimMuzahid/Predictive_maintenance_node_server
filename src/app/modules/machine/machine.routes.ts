import express, { Router } from 'express';
import { machineController } from './machine.controller';
import validateRequest from '../../middlewares/validateRequest';
import { machineValidation } from './machine.validation';

const router: Router = express.Router();

router.post(
  '/add-sensor-non-connected-machine',
  validateRequest(machineValidation.createNonConnectedMachineValidationSchema),
  machineController.addSensorNonConnectedMachine,
);
router.post(
  '/add-sensor-connected-machine',
  validateRequest(machineValidation.createConnectedMachineValidationSchema),
  machineController.addSensorConnectedMachine,
);

router.patch(
  '/add-sensor-module-to-machine',
  machineController.addSensorModuleInToMachine,
);

router.patch(
  '/add-sensor-module-attached-to-machine',
  machineController.addSensorAttachedModuleInToMachine,
);

router.put(
  '/update-machine-package-status',
  machineController.updateMachinePackageStatus,
);

router.get('/washing-machine/user', machineController.getMyWashingMachine);
router.get('/general-machine/user', machineController.getMyGeneralMachine);
router.get(
  '/general-machine/non-connected/user',
  machineController.getUserNonConnectedGeneralMachine,
);
router.get(
  '/connected-machine/user',
  machineController.getUserConnectedMachine,
);
router.get('/getAllMachineBy_id', machineController.getAllMachineBy_id);
router.get('/getMachineBy_id', machineController.getMachineBy_id);
router.delete('/', machineController.deleteMachine);

// this endpoint is not used in this server
// -relocated-to-another-server
router.patch(
  '/machine-health-status-relocated-to-another-server',
  validateRequest(machineValidation.machineHealthStatusSchema),
  machineController.machineHealthStatus,
);
router.get('/machine-report', machineController.machineReport);
router.get(
  '/machine-performance-brand-wise',
  machineController.machinePerformanceBrandWise,
);
router.get(
  '/machine-performance-brand-wise',
  machineController.machinePerformanceBrandWise,
);
router.get(
  '/machine-performance-model-wise',
  machineController.machinePerformanceModelWise,
);
// router.put('/status', machineController.changeStatus);
// router.put('/sensor', machineController.addSensor);
export const machineRoutes = router;

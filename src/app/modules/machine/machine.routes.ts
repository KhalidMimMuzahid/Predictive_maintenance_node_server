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
  '/connected-machine/user',
  machineController.getUserConnectedMachine,
);
router.delete('/', machineController.deleteMachine);
// router.put('/status', machineController.changeStatus);
// router.put('/sensor', machineController.addSensor);
export const machineRoutes = router;

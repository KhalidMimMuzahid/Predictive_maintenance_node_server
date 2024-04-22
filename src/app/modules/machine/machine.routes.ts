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


// router.get('/washing-machine/user/:uid', machineController.getMyWashingMachine);
// router.get('/general-machine/user/:uid', machineController.getMyGeneralMachine);
// router.get('/:id', machineController.getMachine);
// router.delete('/', machineController.deleteMachine);
// router.put('/status', machineController.changeStatus);
// router.put('/sensor', machineController.addSensor);
export const machineRoutes = router;

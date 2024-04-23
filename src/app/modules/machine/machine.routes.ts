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

<<<<<<< HEAD
// Start ------------------------------- XXXXX ----------------------------
// those routers are for root user role routes
router.post('/', machineController.createWashingMachine);
router.get('/washing-machine/user', machineController.getMyWashingMachine);
router.get('/general-machine/user', machineController.getMyGeneralMachine);
router.get('/:id', machineController.getMachine);
router.delete('/', machineController.deleteMachine);
router.put('/status', machineController.changeStatus);
router.put('/sensor', machineController.addSensor);
// End --------------------------------- XXXXX ----------------------------
=======

// router.get('/washing-machine/user/:uid', machineController.getMyWashingMachine);
// router.get('/general-machine/user/:uid', machineController.getMyGeneralMachine);
// router.get('/:id', machineController.getMachine);
// router.delete('/', machineController.deleteMachine);
// router.put('/status', machineController.changeStatus);
// router.put('/sensor', machineController.addSensor);
>>>>>>> 12ab0619eb4a71c040f35f8bdc58f4192d08d1d7
export const machineRoutes = router;

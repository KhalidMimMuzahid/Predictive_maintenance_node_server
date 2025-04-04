import express, { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { machineController } from './machine.controller';
import { machineValidation } from './machine.validation';
import { updateAddressValidationSchema } from '../common/common.validation';
import { sensorModuleAttachedValidation } from '../sensorModuleAttached/sensorModuleAttached.validation';

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
  '/update-address',
  validateRequest(updateAddressValidationSchema),
  machineController.updateAddress,
);

router.patch(
  '/add-sensor-module-attached-to-machine',
  validateRequest(
    sensorModuleAttachedValidation.createSensorModuleAttachedSchema,
  ),
  machineController.addSensorAttachedModuleInToMachine,
);

router.put(
  '/update-machine-package-status',
  machineController.updateMachinePackageStatus,
);

router.get('/washing-machine/user', machineController.getMyWashingMachine);
router.get('/general-machine/user', machineController.getMyGeneralMachine);
router.get(
  '/get-all-machines-list-by-user',
  machineController.getAllMachinesListByUser,
);
router.get(
  '/get-all-machines-list-by-user-sensor-type-wise',
  machineController.getAllMachinesListByUserSensorTypeWise,
);
router.get(
  '/general-machine/non-connected/user',
  machineController.getUserNonConnectedGeneralMachine,
);
router.get(
  '/connected-machine/user',
  machineController.getUserConnectedMachine,
);
router.get('/getAllMachineBy_id', machineController.getAllMachineBy_id);
router.get(
  '/get-all-sensor-section-wise-by-machine',
  machineController.getAllSensorSectionWiseByMachine,
);


router.get(
  '/get-all-sensor-section-names-by-machine',
  machineController.getAllSensorSectionNamesByMachine,
);
router.get('/getMachineBy_id', machineController.getMachineBy_id);
router.delete('/', machineController.deleteMachine);

// this endpoint is not used in this server
// -relocated-to-another-server
router.patch(
  '/machine-health-status-relocated-to-another-server',
  validateRequest(machineValidation.machineHealthStatusSchema),
  machineController.machineHealthStatus,
);
router.post(
  '/machine-report',
  validateRequest(machineValidation.durationDateSchema),
  machineController.machineReport,
);

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

router.patch('/edit-machine', machineController.editMachine);

// router.put('/status', machineController.changeStatus);
// router.put('/sensor', machineController.addSensor);
export const machineRoutes = router;

import express, { Router } from 'express';
import { machineController } from './machine.controller';

const router: Router = express.Router();

// Start ------------------------------- XXXXX ----------------------------
// those routers are for special user role routes
// router.use("/engineer", engineerRoutes)
// router.use("/branch-manager", branchManagerRoutes)
// etc etc etc
// End --------------------------------- XXXXX ----------------------------

// Start ------------------------------- XXXXX ----------------------------
// those routers are for root user role routes
router.post('/', machineController.createWashingMachine);
router.get('/washing-machine/user/:uid', machineController.getMyWashingMachine);
router.get('/general-machine/user/:uid', machineController.getMyGeneralMachine);
router.get('/:id', machineController.getMachine);
router.delete('/', machineController.deleteMachine);
router.put('/status', machineController.changeStatus);
router.put('/sensor', machineController.addSensor);
// End --------------------------------- XXXXX ----------------------------
export const machineRoutes = router;

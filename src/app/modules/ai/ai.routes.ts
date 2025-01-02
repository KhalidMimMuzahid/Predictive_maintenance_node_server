import express, { Router } from 'express';
import { aiController } from './ai.controller';
import validateRequest from '../../middlewares/validateRequest';
import { aiValidation } from './ai.validation';

const router: Router = express.Router();

router.post(
  '/add-threshold',
  validateRequest(aiValidation.thresholdSchema),
  aiController.addThreshold,
);
router.get('/ai-performance', aiController.aiPerformance);
// -relocated-to-another-server
router.get('/get-ai-data-relocated-to-another-server', aiController.getAiData);
router.get(
  '/get-maintenance-due-by-machine',
  aiController.getMaintenanceDueByMachine,
);
router.get('/get-life-cycle-by-machine', aiController.getLifeCycleByMachine);
router.get('/get-machine-bad-sections', aiController.getMachineBadSections);



router.get('/get-thresholds', aiController.getThresholds);

export const aiRoutes = router;

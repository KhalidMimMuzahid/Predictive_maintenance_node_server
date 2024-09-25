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
router.get('/get-ai-data', aiController.getAiData);



router.get('/get-thresholds', aiController.getThresholds);

export const aiRoutes = router;

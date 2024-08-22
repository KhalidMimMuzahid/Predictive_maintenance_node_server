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

export const aiRoutes = router;

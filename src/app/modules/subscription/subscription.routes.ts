import express, { Router } from 'express';
import { subscriptionControllers } from './subscription.controller';
import validateRequest from '../../middlewares/validateRequest';
import { subscriptionValidation } from './subscription.validation';

const router: Router = express.Router();

router.post(
  '/create-subscription',
  validateRequest(subscriptionValidation.createSubscriptionSchema),
  subscriptionControllers.createSubscription,
);

export const subscriptionRoutes = router;

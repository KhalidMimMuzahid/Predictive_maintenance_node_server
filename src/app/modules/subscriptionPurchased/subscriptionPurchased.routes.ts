import express, { Router } from 'express';
import { subscriptionPurchasedControllers } from './subscriptionPurchased.controller';

const router: Router = express.Router();

router.post(
  '/purchased-subscription',
  subscriptionPurchasedControllers.purchaseSubscription,
);

export const subscriptionPurchasedRoutes = router;

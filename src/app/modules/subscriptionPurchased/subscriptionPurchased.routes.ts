import express, { Router } from 'express';
import { subscriptionPurchasedControllers } from './subscriptionPurchased.controller';

const router: Router = express.Router();

router.post(
  '/purchased-subscription',
  subscriptionPurchasedControllers.purchaseSubscription,
);
router.get(
  '/get-my-all-subscriptions',
  subscriptionPurchasedControllers.getAllMySubscriptions,
);
router.patch(
  '/renew-subscription',
  subscriptionPurchasedControllers.renewSubscription,
);

export const subscriptionPurchasedRoutes = router;

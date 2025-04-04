import express, { Router } from 'express';
import { subscriptionPurchasedControllers } from './subscriptionPurchased.controller';

const router: Router = express.Router();

router.post(
  '/purchased-subscription',
  subscriptionPurchasedControllers.purchaseSubscriptionForCustomer,
);
router.post(
  '/purchased-subscription-for-service-provider-company',
  subscriptionPurchasedControllers.purchaseSubscriptionForServiceProviderCompany,
);
router.get(
  '/get-my-all-subscriptions', // all active subscriptions
  subscriptionPurchasedControllers.getAllMySubscriptions,
);
router.patch(
  '/renew-subscription',
  subscriptionPurchasedControllers.renewSubscription,
);
router.get(
  '/get-all-subscription-purchased-by-user',
  subscriptionPurchasedControllers.getAllSubscriptionPurchasedHistoryByUser,
);

export const subscriptionPurchasedRoutes = router;

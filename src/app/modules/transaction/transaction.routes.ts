import express, { Router } from 'express';

import { transactionControllers } from './transaction.controller';

const router: Router = express.Router();

// router.get('/get-recent-transfer', transactionControllers.getRecentTransfers);
router.post('/create-stripe-checkout-session', transactionControllers.createStripeCheckoutSession);
router.post(
  '/webhook-for-stripe',
  express.raw({ type: 'application/json' }),
  transactionControllers.webhookForStripe,
);

export const transactionRoutes = router;

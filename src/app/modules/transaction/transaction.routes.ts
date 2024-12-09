import express, { Router } from 'express';

import { transactionControllers } from './transaction.controller';

const router: Router = express.Router();
// | 'bonus-joiningBonus'
// | 'bonus-referenceBonus'
// | 'walletInterchange-balanceToShowaMB'
// | 'fundTransfer'
// | 'payment-productPurchase'
// | 'payment-subscriptionPurchase'
// | 'addFund-bankAccount';
// router.get('/get-recent-transfer', transactionControllers.getRecentTransfers);

// 'addFund-card'
router.post('/create-stripe-checkout-session', transactionControllers.createStripeCheckoutSession);
router.post(
  '/webhook-for-stripe',
  express.raw({ type: 'application/json' }),
  transactionControllers.webhookForStripe,
);
router.post(
  '/wallet-interchange-point-to-balance',
  transactionControllers.walletInterchangePointToBalance,
);

router.post(
  '/fund-transfer-balance-send',
  transactionControllers.fundTransferBalanceSend,
);

router.post(
  '/fund-transfer-showa-mb-send',
  transactionControllers.fundTransferShowaMBSend,
);

router.post(
  '/fund-transfer-balance-receive',
  transactionControllers.fundTransferBalanceReceive,
);
router.patch(
  '/update-fund-transfer-balance-receive-status',
  transactionControllers.updateFundTransferBalanceReceiveStatus,
);

export const transactionRoutes = router;
                                                                                         
   
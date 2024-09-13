import express, { Router } from 'express';

import { walletControllers } from './wallet.controller';

const router: Router = express.Router();

router.post('/transfer-cash', walletControllers.addTransfer);
router.get('/fetch-customer-cards', walletControllers.fetchCustomerCards);
router.post('/create-setup-intent', walletControllers.createSetupIntent);
router.post('/pay-with-wallet', walletControllers.payWithWallet);
router.post('/pay-with-card', walletControllers.payWithCard);
router.post('/create-payment-intent', walletControllers.createPaymentIntent);
router.post('/transfer-mb', walletControllers.mbTransfer);
router.get('/get-my-mb-transaction', walletControllers.getMyMBTransaction);
router.get('/get-recent-mb-transfer', walletControllers.getRecentMBTransfer);
router.post('/add-card', walletControllers.addCardToMyWallet);
router.delete('/delete-card', walletControllers.deleteCardFromMyWallet);

export const walletRoutes = router;

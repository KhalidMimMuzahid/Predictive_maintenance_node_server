import express, { Router } from 'express';

import validateRequest from '../../middlewares/validateRequest';
import { walletControllers } from './wallet.controller';
import { WalletValidationSchema } from './wallet.validation';

const router: Router = express.Router();

// router.post('/transfer-cash', walletControllers.addTransfer);
// router.get('/fetch-customer-cards', walletControllers.fetchCustomerCards);
// router.post('/create-setup-intent', walletControllers.createSetupIntent);
// router.post('/pay-with-wallet', walletControllers.payWithWallet);
// router.post('/pay-with-card', walletControllers.payWithCard);
// router.post('/create-payment-intent', walletControllers.createPaymentIntent);
// router.post('/transfer-mb', walletControllers.mbTransfer);
// router.get('/get-my-mb-transaction', walletControllers.getMyMBTransaction);
// router.get('/get-recent-mb-transfer', walletControllers.getRecentMBTransfer);

router.get('/get-my-wallet', walletControllers.getMyWallet);
router.post('/add-card', walletControllers.addCardToMyWallet);
router.delete('/delete-card', walletControllers.deleteCardFromMyWallet);
router.patch(
  '/edit-wallet',
  validateRequest(WalletValidationSchema),
  walletControllers.editWallet,
);

export const walletRoutes = router;

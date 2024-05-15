import express, { Router } from 'express';

import { walletControllers } from './wallet.controller';

const router: Router = express.Router();

router.post('/transfer-cash', walletControllers.addTransfer);

export const walletRoutes = router;

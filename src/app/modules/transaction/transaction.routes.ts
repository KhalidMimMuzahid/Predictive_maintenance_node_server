import express, { Router } from 'express';

import { transactionControllers } from './transaction.controller';

const router: Router = express.Router();

router.get('/get-recent-transfer', transactionControllers.getRecentTransfers);

export const transactionRoutes = router;

import express, { Router } from 'express';

import { extraDataController } from './extraData.controller';
const router: Router = express.Router();

router.post('/delete-my-account', extraDataController.deleteMyAccount);

export const extraDataRoutes = router;

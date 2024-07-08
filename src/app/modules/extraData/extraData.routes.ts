import express, { Router } from 'express';

import { extraDataController } from './extraData.controller';
const router: Router = express.Router();

router.post('/delete-my-account', extraDataController.deleteMyAccount);


// those router is only for testings
router.get('/send-iot-data-ai-server', extraDataController.sendIotDataAiServer);

export const extraDataRoutes = router;

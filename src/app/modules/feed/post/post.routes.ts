import express, { Router } from 'express';

const router: Router = express.Router();

// router.post(
//   '/create-personal-chat',
//   // validateRequest(chatValidation.createPersonalChatValidationSchema),
//   chatController.createPersonalChat,
// );

export const postRoutes = router;

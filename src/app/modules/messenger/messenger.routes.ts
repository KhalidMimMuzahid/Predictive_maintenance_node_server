import express, { Router } from 'express';
import { chatRoutes } from './chat/chat.routes';
import { messageRoutes } from './message/message.routes';

const router: Router = express.Router();

const subModuleRoutes: { path: string; route: express.Router }[] = [
  { path: '/chat', route: chatRoutes },
  { path: '/message', route: messageRoutes },
];

subModuleRoutes.forEach((route) => router.use(route.path, route.route));
export const messengerRoutes = router;

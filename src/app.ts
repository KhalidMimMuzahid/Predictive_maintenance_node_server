import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFoundErrorHandler from './app/middlewares/notFOund';
import router from './app/routes/index';
import { manageAuth } from './app/middlewares/manageAuth';
import http from 'http';
import { Server } from 'socket.io';

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

//parsers
app.use(express.json());
app.use(cors());

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// application routes
app.use('/api/v2', manageAuth, router);

const showWelcome = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to Showa home' });
};
app.use('/', showWelcome);
app.use(globalErrorHandler);
app.use('*', notFoundErrorHandler);

export default app;

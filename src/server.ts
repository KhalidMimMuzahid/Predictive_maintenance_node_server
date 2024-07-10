/* eslint-disable no-console */
import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFoundErrorHandler from './app/middlewares/notFOund';
import router from './app/routes/index';
import { manageAuth } from './app/middlewares/manageAuth';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { cronFunctions } from './app/utils/cronFunctions/cronFunctions';
import { CronJob } from 'cron';

const app: Application = express();
const server = createServer(app);

async function main() {
  try {
    const io = new Server(server, { cors: { origin: '*' } });

    //parsers
    app.use(express.json());
    app.use(cors());

    io.on('connection', (socket) => {
      console.log(`${socket.id} socket just connected!`);
      socket.on('disconnect', () => {
        console.log('A socket disconnected');
      });
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

    await mongoose.connect(process.env.SHOWA_DB_URL as string);
    server.listen(process.env.PORT, () => {
      console.log(`Showa app listening on port ${process.env.PORT}`);
    });

    // -------- ************* ---------------  // all cron functions starts here
    CronJob.from({
      cronTime: '0 */1 * * * *',
      onTick: cronFunctions.sendIotDataToAIServer,
      start: true,
      timeZone: 'America/Los_Angeles',
    });

    // -------- ************* ---------------  // all cron functions ends here
  } catch (error) {
    console.log(error);
  }
}
main();

process.on('unhandledRejection', () => {
  console.log('unhandledRejection is detected, shutting down ...');
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log('uncaughtException is detected, shutting down ...');
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

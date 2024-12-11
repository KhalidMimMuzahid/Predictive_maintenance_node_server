/* eslint-disable no-console */
import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import cors from 'cors';
// import url from 'url';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFoundErrorHandler from './app/middlewares/notFOund';
import router from './app/routes/index';
// const routerForStripeWebHook = express.Router();
import { manageAuth } from './app/middlewares/manageAuth';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fileUpload from 'express-fileupload';
// import { transactionControllers } from './app/modules/transaction/transaction.controller';
import { transactionRoutes } from './app/modules/transaction/transaction.routes';
// import { cronFunctions } from './app/utils/cronFunctions/cronFunctions';
// import { CronJob } from 'cron';

export const app: Application = express();
const server = createServer(app);
export const users = new Map();
async function main() {
  try {
    const io = new Server(server, { cors: { origin: '*' } });

    app.use(
      '/api/v2/transaction/webhook',
      express.raw({ type: 'application/json' }),
      transactionRoutes,
    );
    //parsers
    app.use(express.json());
    app.use(cors());
    // app.use(express.urlencoded({extended: true}))
    app.use(fileUpload());
    // app.use((req, res, next) => {
    //   const parsedUrl = url.parse(req?.url);
    //   const pathname: string = parsedUrl?.pathname as string;
    //   if (pathname?.endsWith('webhook-for-stripe')) {
    //     express.raw({ type: 'application/json' })(req, res, next);
    //   } else {
    //     // express.json()(req, res, next);

    //     express.json()(req, res, (err) => {
    //       if (err) return next(err); // Handle JSON parsing errors
    //       cors()(req, res, (err) => {
    //         if (err) return next(err); // Handle CORS errors
    //         fileUpload()(req, res, next); // Proceed with fileUpload
    //       });
    //     });
    //   }
    // });

    io.on('connection', (socket) => {
      const socketId = socket?.id;
      // console.log(`${socket.id} socket just connected!`);
      let connectedUser: string;

      socket.on('register', (user) => {
        // console.log('\n---------------- start----------------------\n');
        // console.log('A socket ' + socket.id + ' connected with user: ', user);
        if (user) {
          connectedUser = user;

          if (!users.has(user)) {
            // Replace the value
            users.set(user, [socketId]);
          } else {
            const socketIds = users.get(user) as string[];
            socketIds.push(socketId);
            users.set(user, socketIds);
          }
          // users.set(user, socket?.id);
        }

        // console.log(users);
      });
      socket.on('disconnect', () => {
        if (users.has(connectedUser)) {
          const socketIds = users.get(connectedUser) as string[];
          const index = socketIds.findIndex((item) => item === socketId);
          if (index !== -1) {
            // Remove the element at the found index
            socketIds.splice(index, 1);
            if (socketIds?.length) {
              users.set(connectedUser, socketIds);
            } else {
              users.delete(connectedUser);
            }
          }
        }
        // console.log(
        //   'A socket ' + socket.id + ' disconnect with user: ',
        //   connectedUser,
        // );
        // console.log(users);
        // console.log('\n---------------- end----------------------\n');
      });
    });

    app.use((req, res, next) => {
      req.io = io;

      next();
    });

    // for this endpoint, webhook-for-stripe

    // application routes
    app.use('/api/v2', manageAuth, router);

    const showWelcome = (req: Request, res: Response) => {
      // {
      //   console.log('---------------------------');
      //   const { type, register, disconnect } = req.body;
      //   if (type === 'register') {
      //     const { user, socketId } = register;
      //     if (user) {
      //       if (!users.has(user)) {
      //         // Replace the value
      //         users.set(user, [socketId]);
      //       } else {
      //         const socketIds = users.get(user) as string[];
      //         socketIds.push(socketId);
      //         users.set(user, socketIds);
      //       }
      //       // users.set(user, socket?.id);
      //     }
      //   } else if (type === 'disconnect') {
      //     const { user, socketId } = disconnect;
      //     if (users.has(user)) {
      //       const socketIds = users.get(user) as string[];
      //       const index = socketIds.findIndex((item) => item === socketId);
      //       if (index !== -1) {
      //         // Remove the element at the found index
      //         socketIds.splice(index, 1);
      //         if (socketIds?.length) {
      //           users.set(user, socketIds);
      //         } else {
      //           users.delete(user);
      //         }
      //       }
      //     }
      //   }
      //   console.log(users);
      //   // else if(data?.type === "get"){
      //   //   res.status(200).json({
      //   //     // message: 'Welcome to Showa home version 2.0.2' ,
      //   //     body: data,
      //   //   });
      //   // }
      // }
      res.status(200).json({
        message: 'Welcome to Showa home version 2.0.19',
      });
    };
    app.use('/', showWelcome);
    app.use(globalErrorHandler);
    app.use('*', notFoundErrorHandler);

    await mongoose.connect(process.env.SHOWA_DB_URL as string);
    server.listen(process.env.PORT, () => {
      console.log(`Showa app listening on port ${process.env.PORT}`);
    });

    // -------- ************* ---------------  // all cron functions starts here
    // CronJob.from({
    //   cronTime: '0 */1 * * * *',
    //   onTick: cronFunctions.sendIotDataToAIServer,
    //   start: true,
    //   timeZone: 'America/Los_Angeles',
    // });

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

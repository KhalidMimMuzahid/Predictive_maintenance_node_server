import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFoundErrorHandler from './app/middlewares/notFOund';
import router from './app/routes/index';
const app: Application = express();

//parsers
app.use(express.json());
app.use(cors());

// application routes
app.use('/api/v2', router);

const showWelcome = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to Showa home' });
};
app.use('/', showWelcome);
app.use(globalErrorHandler);
app.use('*', notFoundErrorHandler);

export default app;

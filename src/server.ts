/* eslint-disable no-console */
import app from './app';
import mongoose from 'mongoose';
import 'dotenv/config';
// import config from './app/config';
import { Server } from 'http';
let server: Server;
async function main() {
  try {
    await mongoose.connect(process.env.SHOWA_DB_URL as string);
    server = app.listen(process.env.PORT, () => {
      console.log(`Showa app listening on port ${process.env.PORT}`);
    });
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

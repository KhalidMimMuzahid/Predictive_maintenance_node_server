import { IncomingHttpHeaders } from 'http';
import { JwtPayload } from 'jsonwebtoken';
import { Server } from 'socket.io';

export {};

declare global {
  namespace Express {
    export interface Request {
      headers: IncomingHttpHeaders & {
        auth?: JwtPayload;
      };
      io: Server;
    }
  }
}

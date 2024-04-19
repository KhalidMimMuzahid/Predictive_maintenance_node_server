import { IncomingHttpHeaders } from 'http';
import { JwtPayload } from 'jsonwebtoken';

export {};

declare global {
  namespace Express {
    export interface Request {
      headers: IncomingHttpHeaders & {
        auth?: JwtPayload;
      };
    }
  }
}

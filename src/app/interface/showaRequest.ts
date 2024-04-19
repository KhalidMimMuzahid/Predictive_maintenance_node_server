import { IncomingHttpHeaders } from 'http';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

interface ShowaRequest extends Request {
  headers: IncomingHttpHeaders & {
    auth?: JwtPayload;
  };
}

export { ShowaRequest };

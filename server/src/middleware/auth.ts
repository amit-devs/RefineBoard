import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/tokens.js';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  // 1. Try to read from cookie
  let token = req.cookies?.token;

  // 2. Try to read from Authorization: Bearer <token>
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    return;
  }

  req.user = payload;
  next();
}

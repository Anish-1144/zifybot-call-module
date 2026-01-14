import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../lib/jwt.utils';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'No token provided. Please provide a valid authentication token.',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token. Please login again.',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Authentication error',
    });
    return;
  }
};

export const authorize = (...roles: ('admin' | 'user')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized. Please authenticate first.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden. You do not have permission to access this resource.',
      });
      return;
    }

    next();
  };
};


import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    res.status(401);
    throw new Error('Ban can dang nhap de tiep tuc.');
  }

  const decoded = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(decoded.sub);

  if (!user || user.accountStatus !== 'active') {
    res.status(401);
    throw new Error('Tai khoan khong hop le hoac da bi khoa.');
  }

  req.user = user;
  next();
});

export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    const hasRole = req.user?.roles?.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      res.status(403);
      throw new Error('Ban khong co quyen truy cap chuc nang nay.');
    }
    next();
  };

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { recordAuditLog } from '../services/auditService.js';
import { serializeUser } from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const signToken = (userId) => jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: '7d' });

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error('Vui long nhap day du ten dang nhap va mat khau.');
  }

  const user = await User.findOne({ username: username.toLowerCase() }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Thong tin dang nhap khong chinh xac.');
  }

  if (user.accountStatus !== 'active') {
    res.status(403);
    throw new Error('Tai khoan dang bi khoa.');
  }

  const isMatched = await user.comparePassword(password);
  if (!isMatched) {
    res.status(401);
    throw new Error('Thong tin dang nhap khong chinh xac.');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({
    token: signToken(user._id),
    user: await serializeUser(user)
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    user: await serializeUser(req.user)
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Vui long nhap mat khau hien tai va mat khau moi.');
  }

  if (newPassword.length < 8) {
    res.status(400);
    throw new Error('Mat khau moi phai co it nhat 8 ky tu.');
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatched = await user.comparePassword(currentPassword);

  if (!isMatched) {
    res.status(400);
    throw new Error('Mat khau hien tai khong chinh xac.');
  }

  const isReused = await user.comparePassword(newPassword);
  if (isReused) {
    res.status(400);
    throw new Error('Mat khau moi phai khac mat khau hien tai.');
  }

  user.password = newPassword;
  user.mustChangePassword = false;
  await user.save();

  await recordAuditLog({
    actor: user._id,
    action: 'user.password_changed',
    subjectType: 'User',
    subjectId: String(user._id),
    ipAddress: req.ip
  });

  res.json({
    message: 'Da cap nhat mat khau thanh cong.'
  });
});

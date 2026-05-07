import User from '../models/User.js';
import { createUserAccount, syncUserRoles } from '../services/accountService.js';
import { recordAuditLog } from '../services/auditService.js';
import { serializeUsers } from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.accountStatus) {
    filter.accountStatus = req.query.accountStatus;
  }
  if (req.query.role) {
    filter.roles = req.query.role;
  }
  if (req.query.q?.trim()) {
    const keyword = req.query.q.trim();
    filter.$or = [
      { username: { $regex: keyword, $options: 'i' } },
      { displayName: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } }
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({
    items: await serializeUsers(users)
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const { username, password, displayName, email, roles, staffUnit } = req.body;

  if (!username || !displayName || !Array.isArray(roles) || roles.length === 0) {
    res.status(400);
    throw new Error('Vui long nhap username, ten hien thi va it nhat mot vai tro.');
  }

  const createdAccount = await createUserAccount({
    username,
    password,
    displayName,
    email,
    roles,
    linkedModel: 'Staff',
    staffUnit
  });

  await recordAuditLog({
    actor: req.user._id,
    action: 'user.created',
    subjectType: 'User',
    subjectId: String(createdAccount.user._id),
    ipAddress: req.ip,
    details: {
      username: createdAccount.user.username,
      roles: createdAccount.user.roles
    }
  });

  res.status(201).json({
    item: (await serializeUsers([createdAccount.user]))[0],
    temporaryPassword: createdAccount.temporaryPassword
  });
});

export const toggleUserLock = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(404);
    throw new Error('Khong tim thay tai khoan.');
  }

  if (String(user._id) === String(req.user._id)) {
    res.status(400);
    throw new Error('Admin khong the khoa chinh tai khoan cua minh.');
  }

  user.accountStatus = user.accountStatus === 'active' ? 'locked' : 'active';
  await user.save({ validateBeforeSave: false });

  await recordAuditLog({
    actor: req.user._id,
    action: user.accountStatus === 'locked' ? 'user.locked' : 'user.unlocked',
    subjectType: 'User',
    subjectId: String(user._id),
    ipAddress: req.ip,
    details: {
      username: user.username
    }
  });

  res.json({
    item: (await serializeUsers([user]))[0]
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('+password');
  if (!user) {
    res.status(404);
    throw new Error('Khong tim thay tai khoan.');
  }

  user.password = 'Temp@12345';
  user.mustChangePassword = true;
  await user.save();

  await recordAuditLog({
    actor: req.user._id,
    action: 'user.password_reset',
    subjectType: 'User',
    subjectId: String(user._id),
    ipAddress: req.ip,
    details: {
      username: user.username
    }
  });

  res.json({
    message: 'Mat khau tam thoi da duoc dat lai.',
    temporaryPassword: 'Temp@12345'
  });
});

export const updateUserRoles = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(404);
    throw new Error('Khong tim thay tai khoan.');
  }

  const { roles, staffUnit } = req.body;
  if (!Array.isArray(roles) || roles.length === 0) {
    res.status(400);
    throw new Error('Tai khoan phai co it nhat mot vai tro.');
  }

  if (staffUnit !== undefined) {
    user.staffUnit = staffUnit;
  }
  await user.save({ validateBeforeSave: false });
  await syncUserRoles(user, roles);

  await recordAuditLog({
    actor: req.user._id,
    action: 'user.roles_updated',
    subjectType: 'User',
    subjectId: String(user._id),
    ipAddress: req.ip,
    details: {
      username: user.username,
      roles: user.roles
    }
  });

  res.json({
    item: (await serializeUsers([user]))[0]
  });
});

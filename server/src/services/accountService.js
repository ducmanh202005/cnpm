import User from '../models/User.js';
import { syncStaffProfile } from './profileSyncService.js';
import { syncUserRoles } from './rbacService.js';

const cleanSeed = (value = '') =>
  String(value)
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-6);

export const generateTemporaryPassword = (seed = 'User') => {
  const normalized = cleanSeed(seed) || 'User';
  const capitalized = `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
  return `${capitalized}@2026`;
};

export const ensureUsernameAvailable = async (username) => {
  const normalized = username.trim().toLowerCase();
  const existing = await User.findOne({ username: normalized }).lean();
  if (existing) {
    throw new Error('Ten dang nhap da ton tai.');
  }
  return normalized;
};

export const createUserAccount = async ({
  username,
  password,
  displayName,
  email,
  roles,
  linkedModel,
  linkedId,
  staffUnit
}) => {
  const normalizedUsername = await ensureUsernameAvailable(username);
  const finalPassword = password || generateTemporaryPassword(normalizedUsername);

  const user = await User.create({
    username: normalizedUsername,
    password: finalPassword,
    displayName,
    email,
    roles,
    primaryRole: Array.isArray(roles) ? roles[0] : undefined,
    linkedModel,
    linkedId,
    staffUnit
  });

  if (linkedModel === 'Staff') {
    await syncStaffProfile({
      user,
      displayName,
      email,
      staffUnit
    });
  }

  await syncUserRoles(user, roles);

  return {
    user,
    temporaryPassword: password ? null : finalPassword
  };
};

export const syncLinkedUserStatus = async ({ linkedModel, linkedId, isActive }) => {
  const user = await User.findOne({ linkedModel, linkedId });
  if (!user) {
    return null;
  }

  user.accountStatus = isActive ? 'active' : 'locked';
  await user.save({ validateBeforeSave: false });
  return user;
};

export { syncUserRoles };

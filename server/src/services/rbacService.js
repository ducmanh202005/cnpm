import { PERMISSIONS, ROLE_PERMISSIONS } from '../constants/permissions.js';
import AccountRole from '../models/AccountRole.js';
import Permission from '../models/Permission.js';
import Role from '../models/Role.js';
import RolePermission from '../models/RolePermission.js';

export const ensureRbacCatalog = async () => {
  for (const permission of PERMISSIONS) {
    await Permission.findOneAndUpdate(
      { code: permission.code },
      { ...permission, description: `${permission.resource}:${permission.action}` },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  for (const [code, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await Role.findOneAndUpdate(
      { code },
      { code, name: code, description: `Role ${code}` },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const permissionDocs = await Permission.find({ code: { $in: permissions } });
    await RolePermission.deleteMany({ role: role._id });
    if (permissionDocs.length > 0) {
      await RolePermission.insertMany(
        permissionDocs.map((permission) => ({
          role: role._id,
          permission: permission._id
        })),
        { ordered: false }
      ).catch(() => null);
    }
  }
};

export const syncUserRoles = async (user, roles = []) => {
  await ensureRbacCatalog();

  const roleDocs = await Role.find({ code: { $in: roles } });
  user.roles = roles;
  user.primaryRole = roleDocs[0]?._id || null;
  await user.save({ validateBeforeSave: false });

  await AccountRole.deleteMany({ account: user._id });
  if (roleDocs.length > 0) {
    await AccountRole.insertMany(
      roleDocs.map((role) => ({
        account: user._id,
        role: role._id
      })),
      { ordered: false }
    ).catch(() => null);
  }

  return roleDocs;
};

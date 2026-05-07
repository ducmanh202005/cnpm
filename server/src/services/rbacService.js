export const ensureRbacCatalog = async () => null;

export const syncUserRoles = async (user, roles = []) => {
  const normalizedRoles = [...new Set(roles.filter(Boolean))];
  user.roles = normalizedRoles;
  user.primaryRole = normalizedRoles[0] || null;
  await user.save({ validateBeforeSave: false });
  return normalizedRoles;
};

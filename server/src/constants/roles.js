export const ROLES = {
  STUDENT: 'student',
  ACADEMIC: 'academic_office',
  FINANCE: 'finance_office',
  LECTURER: 'lecturer',
  ADMIN: 'admin'
};

export const ALL_ROLES = Object.values(ROLES);

export const ROLE_LABELS = {
  [ROLES.STUDENT]: 'Sinh vien',
  [ROLES.ACADEMIC]: 'Phong dao tao',
  [ROLES.FINANCE]: 'Phong tai chinh',
  [ROLES.LECTURER]: 'Giang vien',
  [ROLES.ADMIN]: 'Admin'
};

import { ROLES } from './roles.js';

export const PERMISSIONS = [
  { resource: 'dashboard', action: 'view', code: 'dashboard:view' },
  { resource: 'courses', action: 'manage', code: 'courses:manage' },
  { resource: 'sections', action: 'manage', code: 'sections:manage' },
  { resource: 'registration_periods', action: 'manage', code: 'registration_periods:manage' },
  { resource: 'semesters', action: 'manage', code: 'semesters:manage' },
  { resource: 'students', action: 'manage', code: 'students:manage' },
  { resource: 'students', action: 'register', code: 'students:register' },
  { resource: 'lecturers', action: 'manage', code: 'lecturers:manage' },
  { resource: 'teaching', action: 'view', code: 'teaching:view' },
  { resource: 'tuition', action: 'view', code: 'tuition:view' },
  { resource: 'tuition_rates', action: 'manage', code: 'tuition_rates:manage' },
  { resource: 'payments', action: 'manage', code: 'payments:manage' },
  { resource: 'receipts', action: 'view', code: 'receipts:view' },
  { resource: 'reports', action: 'view', code: 'reports:view' },
  { resource: 'users', action: 'manage', code: 'users:manage' },
  { resource: 'rbac', action: 'manage', code: 'rbac:manage' },
  { resource: 'audit_logs', action: 'view', code: 'audit_logs:view' }
];

export const ROLE_PERMISSIONS = {
  [ROLES.STUDENT]: ['dashboard:view', 'students:register', 'tuition:view', 'receipts:view'],
  [ROLES.ACADEMIC]: [
    'dashboard:view',
    'courses:manage',
    'sections:manage',
    'registration_periods:manage',
    'semesters:manage',
    'students:manage',
    'lecturers:manage',
    'reports:view'
  ],
  [ROLES.FINANCE]: [
    'dashboard:view',
    'tuition:view',
    'tuition_rates:manage',
    'payments:manage',
    'receipts:view',
    'reports:view'
  ],
  [ROLES.LECTURER]: ['dashboard:view', 'teaching:view'],
  [ROLES.ADMIN]: PERMISSIONS.map((item) => item.code)
};

export const permissionsCatalog = Object.entries(ROLE_PERMISSIONS).map(([role, codes]) => ({
  role,
  permissions: codes
}));

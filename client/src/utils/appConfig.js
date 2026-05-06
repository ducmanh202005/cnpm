export const ROLE_LABELS = {
  student: 'Sinh viên',
  academic_office: 'Phòng đào tạo',
  finance_office: 'Phòng tài chính',
  lecturer: 'Giảng viên',
  admin: 'Quản trị hệ thống'
};

export const ROLE_HOME = {
  student: '/app/student',
  academic_office: '/app/academic',
  finance_office: '/app/finance',
  lecturer: '/app/lecturer',
  admin: '/app/admin'
};

/* ── Sidebar navigation per workspace ── */
export const WORKSPACE_NAV = {
  student: [
    { id: 'sv-home', label: 'Trang chủ', icon: '🏠', to: '/app/student' },
    { id: 'sv-reg', label: 'Đăng ký học phần', icon: '📝', to: '/app/student/registration' },
    { id: 'sv-schedule', label: 'Thời khoá biểu', icon: '📅', to: '/app/student/schedule' },
    { id: 'sv-exam', label: 'Lịch thi', icon: '📋', to: '/app/student/exams' },
    { id: 'sv-tuition', label: 'Xem học phí', icon: '💰', to: '/app/student/tuition' },
    { id: 'sv-profile', label: 'Thông tin cá nhân', icon: '👤', to: '/app/student/profile' },
  ],
  academic: [
    { id: 'ac-home', label: 'Trang chủ', icon: '🏠', to: '/app/academic' },
    { id: 'ac-courses', label: 'Quản lý môn học', icon: '📚', to: '/app/academic/courses' },
    { id: 'ac-sections', label: 'Quản lý học phần', icon: '📦', to: '/app/academic/sections' },
    { id: 'ac-students', label: 'Quản lý sinh viên', icon: '🎓', to: '/app/academic/students' },
    { id: 'ac-lecturers', label: 'Quản lý giảng viên', icon: '👨‍🏫', to: '/app/academic/lecturers' },
    { id: 'ac-semesters', label: 'Học kỳ & Đợt ĐK', icon: '📆', to: '/app/academic/semesters' },
  ],
  finance: [
    { id: 'fi-home', label: 'Trang chủ', icon: '🏠', to: '/app/finance' },
    { id: 'fi-rates', label: 'Biểu phí', icon: '📊', to: '/app/finance/rates' },
    { id: 'fi-liab', label: 'Công nợ học phí', icon: '📑', to: '/app/finance/liabilities' },
    { id: 'fi-pay', label: 'Thanh toán', icon: '💳', to: '/app/finance/payments' },
    { id: 'fi-receipt', label: 'Biên lai điện tử', icon: '🧾', to: '/app/finance/receipts' },
  ],
  lecturer: [
    { id: 'lc-home', label: 'Trang chủ', icon: '🏠', to: '/app/lecturer' },
    { id: 'lc-sections', label: 'Học phần phân công', icon: '📦', to: '/app/lecturer/sections' },
    { id: 'lc-exams', label: 'Lịch thi', icon: '📋', to: '/app/lecturer/exams' },
    { id: 'lc-roster', label: 'Danh sách lớp', icon: '📇', to: '/app/lecturer/roster' },
  ],
  admin: [
    { id: 'ad-home', label: 'Trang chủ', icon: '🏠', to: '/app/admin' },
    { id: 'ad-users', label: 'Tài khoản', icon: '👥', to: '/app/admin/users' },
    { id: 'ad-roles', label: 'Phân quyền', icon: '🔐', to: '/app/admin/roles' },
    { id: 'ad-audit', label: 'Audit log', icon: '📜', to: '/app/admin/audit' },
  ],
  overview: [
    { id: 'ov-home', label: 'Tổng quan', icon: '🏠', to: '/app/overview' },
  ]
};

/* Detect which workspace the current path belongs to */
export const getWorkspaceKey = (pathname) => {
  if (pathname.startsWith('/app/student')) return 'student';
  if (pathname.startsWith('/app/academic')) return 'academic';
  if (pathname.startsWith('/app/finance')) return 'finance';
  if (pathname.startsWith('/app/lecturer')) return 'lecturer';
  if (pathname.startsWith('/app/admin')) return 'admin';
  return 'overview';
};

export const hasAnyRole = (user, roles = []) =>
  Boolean(user?.roles?.some((role) => roles.includes(role)));

export const getPrimaryHome = (user) => {
  const role = user?.roles?.find((item) => ROLE_HOME[item]);
  return role ? ROLE_HOME[role] : '/app/overview';
};

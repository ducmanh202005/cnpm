const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const DEV_CLIENT_PORTS = new Set(['4173', '5173']);

const resolveApiUrl = () => {
  const configuredUrl = trimTrailingSlash(import.meta.env.VITE_API_URL || '');
  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api';
  }

  const { hostname, port, protocol } = window.location;

  if (DEV_CLIENT_PORTS.has(port)) {
    return `${protocol}//${hostname}:5000/api`;
  }

  return '/api';
};

const API_URL = resolveApiUrl();

const buildQueryString = (query = {}) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

const parseResponse = async (response) => {
  const raw = await response.text();
  let data = {};

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { message: raw };
    }
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}.`);
  }

  return data;
};

const toConnectionError = (error) => {
  if (error instanceof TypeError) {
    const connectionError = new Error(
      `Khong the ket noi toi may chu dang nhap (${API_URL}). Hay kiem tra backend va cau hinh VITE_API_URL.`
    );
    connectionError.cause = error;
    return connectionError;
  }

  return error;
};

const request = async (path, { method = 'GET', token, body, query } = {}) => {
  try {
    const response = await fetch(`${API_URL}${path}${buildQueryString(query)}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });

    return parseResponse(response);
  } catch (error) {
    throw toConnectionError(error);
  }
};

export const authApi = {
  login(credentials) {
    return request('/auth/login', {
      method: 'POST',
      body: credentials
    });
  },
  me(token) {
    return request('/auth/me', { token });
  },
  changePassword(token, payload) {
    return request('/auth/change-password', {
      method: 'POST',
      token,
      body: payload
    });
  }
};

export const dashboardApi = {
  getOverview(token) {
    return request('/dashboard/overview', { token });
  }
};

export const workspaceApi = {
  student(token) {
    return request('/workspaces/student', { token });
  },
  academic(token) {
    return request('/workspaces/academic', { token });
  },
  finance(token) {
    return request('/workspaces/finance', { token });
  },
  lecturer(token) {
    return request('/workspaces/lecturer', { token });
  },
  admin(token) {
    return request('/workspaces/admin', { token });
  }
};

export const catalogApi = {
  listSemesters(token, query) {
    return request('/catalog/semesters', { token, query });
  },
  listCourses(token, query) {
    return request('/catalog/courses', { token, query });
  },
  listSections(token, query) {
    return request('/catalog/sections', { token, query });
  },
  listRegistrationPeriods(token, query) {
    return request('/catalog/registration-periods', { token, query });
  },
  createCourse(token, payload) {
    return request('/catalog/courses', {
      method: 'POST',
      token,
      body: payload
    });
  },
  createSemester(token, payload) {
    return request('/catalog/semesters', {
      method: 'POST',
      token,
      body: payload
    });
  },
  createSection(token, payload) {
    return request('/catalog/sections', {
      method: 'POST',
      token,
      body: payload
    });
  },
  updateSection(token, sectionId, payload) {
    return request(`/catalog/sections/${sectionId}`, {
      method: 'PATCH',
      token,
      body: payload
    });
  },
  createRegistrationPeriod(token, payload) {
    return request('/catalog/registration-periods', {
      method: 'POST',
      token,
      body: payload
    });
  },
  updateRegistrationPeriod(token, periodId, payload) {
    return request(`/catalog/registration-periods/${periodId}`, {
      method: 'PATCH',
      token,
      body: payload
    });
  }
};

export const studentApi = {
  getProfile(token) {
    return request('/students/me', { token });
  },
  listMyEnrollments(token) {
    return request('/students/my-enrollments', { token });
  },
  listStudents(token, query) {
    return request('/students', { token, query });
  },
  previewRegistration(token, sectionId) {
    return request('/students/register/preview', {
      method: 'POST',
      token,
      body: { sectionId }
    });
  },
  registerSection(token, sectionId) {
    return request('/students/register', {
      method: 'POST',
      token,
      body: { sectionId }
    });
  },
  cancelEnrollment(token, enrollmentId) {
    return request(`/students/enrollments/${enrollmentId}/cancel`, {
      method: 'PATCH',
      token
    });
  },
  createStudent(token, payload) {
    return request('/students', {
      method: 'POST',
      token,
      body: payload
    });
  },
  updateStudent(token, studentId, payload) {
    return request(`/students/${studentId}`, {
      method: 'PATCH',
      token,
      body: payload
    });
  }
};

export const lecturerApi = {
  listLecturers(token, query) {
    return request('/lecturers', { token, query });
  },
  createLecturer(token, payload) {
    return request('/lecturers', {
      method: 'POST',
      token,
      body: payload
    });
  },
  updateLecturer(token, lecturerId, payload) {
    return request(`/lecturers/${lecturerId}`, {
      method: 'PATCH',
      token,
      body: payload
    });
  },
  deleteLecturer(token, lecturerId) {
    return request(`/lecturers/${lecturerId}`, {
      method: 'DELETE',
      token
    });
  }
};

export const financeApi = {
  getMyTuition(token) {
    return request('/finance/tuition/me', { token });
  },
  listRates(token, query) {
    return request('/finance/tuition-rates', { token, query });
  },
  listLiabilities(token, query) {
    return request('/finance/tuition-liabilities', { token, query });
  },
  listPayments(token, query) {
    return request('/finance/payments', { token, query });
  },
  listReceipts(token, query) {
    return request('/finance/receipts', { token, query });
  },
  recomputeLiability(token, payload) {
    return request('/finance/tuition-liabilities/recompute', {
      method: 'POST',
      token,
      body: payload
    });
  },
  createStudentPayment(token, payload) {
    return request('/finance/payments', {
      method: 'POST',
      token,
      body: payload
    });
  },
  recordManualPayment(token, payload) {
    return request('/finance/payments/manual', {
      method: 'POST',
      token,
      body: payload
    });
  },
  createRate(token, payload) {
    return request('/finance/tuition-rates', {
      method: 'POST',
      token,
      body: payload
    });
  }
};

export const adminApi = {
  listUsers(token, query) {
    return request('/admin/users', { token, query });
  },
  listAuditLogs(token, query) {
    return request('/admin/audit-logs', { token, query });
  },
  createUser(token, payload) {
    return request('/admin/users', {
      method: 'POST',
      token,
      body: payload
    });
  },
  toggleUserLock(token, userId) {
    return request(`/admin/users/${userId}/toggle-lock`, {
      method: 'PATCH',
      token
    });
  },
  resetPassword(token, userId) {
    return request(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
      token
    });
  },
  updateRoles(token, userId, payload) {
    return request(`/admin/users/${userId}/roles`, {
      method: 'PATCH',
      token,
      body: payload
    });
  }
};

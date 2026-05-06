import { ROLE_LABELS } from './appConfig.js';

export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);

export const formatDate = (value) => {
  if (!value) {
    return '--';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium'
  }).format(new Date(value));
};

export const formatDateTime = (value) => {
  if (!value) {
    return '--';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

export const formatSchedule = (schedule = []) =>
  schedule
    .map((slot) => `T${slot.dayOfWeek} (${slot.startPeriod}-${slot.startPeriod + slot.periodCount - 1})`)
    .join(', ');

export const formatExamSchedule = (exam) => {
  if (!exam?.examDate) {
    return '--';
  }

  const date = formatDateTime(exam.examDate);
  const room = exam.room ? ` - ${exam.room}` : '';
  const session = exam.sessionLabel ? ` - ${exam.sessionLabel}` : '';
  return `${date}${session}${room}`;
};

export const formatRoles = (roles = []) =>
  roles.map((role) => ROLE_LABELS[role] || role).join(', ');

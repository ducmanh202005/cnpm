const STATUS_MAP = {
  active: { tone: 'success', label: 'Đang hoạt động' },
  approved: { tone: 'success', label: 'Đã duyệt' },
  paid: { tone: 'success', label: 'Đã thanh toán' },
  success: { tone: 'success', label: 'Thành công' },
  in_session: { tone: 'info', label: 'Đang diễn ra' },
  open: { tone: 'info', label: 'Đang mở' },
  registration_open: { tone: 'info', label: 'Mở đăng ký' },
  partial: { tone: 'warning', label: 'Một phần' },
  pending: { tone: 'warning', label: 'Chờ xử lý' },
  on_leave: { tone: 'warning', label: 'Tạm nghỉ' },
  study_leave: { tone: 'warning', label: 'Tạm dừng học tập' },
  leave: { tone: 'warning', label: 'Bảo lưu' },
  planning: { tone: 'neutral', label: 'Kế hoạch' },
  closed: { tone: 'neutral', label: 'Đã đóng' },
  graduated: { tone: 'neutral', label: 'Đã tốt nghiệp' },
  retired: { tone: 'neutral', label: 'Đã nghỉ hưu' },
  unpaid: { tone: 'danger', label: 'Chưa thanh toán' },
  overdue: { tone: 'danger', label: 'Quá hạn' },
  locked: { tone: 'danger', label: 'Đã khoá' },
  suspended: { tone: 'danger', label: 'Tạm ngưng' },
  dismissed: { tone: 'danger', label: 'Buộc thôi học' },
  failed: { tone: 'danger', label: 'Thất bại' },
  cancelled: { tone: 'neutral', label: 'Đã huỷ' },
  full: { tone: 'neutral', label: 'Đã đầy' }
};

const humanize = (value) => {
  if (!value) {
    return '--';
  }

  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function StatusPill({ value }) {
  const status = STATUS_MAP[value] || { tone: 'neutral', label: humanize(value) };
  return <span className={`status-pill status-pill--${status.tone}`}>{status.label}</span>;
}

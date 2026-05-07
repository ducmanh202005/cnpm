import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { studentApi } from '../../api/portalApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, formatSchedule } from '../../utils/formatters.js';

const getId = (item) => item?.id || item?._id || '';
const isActiveEnrollment = (status) => ['approved', 'pending'].includes(status);
const getEnrollmentPriority = (status) => {
  if (status === 'approved') {
    return 3;
  }

  if (status === 'pending') {
    return 2;
  }

  return 1;
};

const resolveMajorOptions = (profile) => {
  const studyMajors = Array.isArray(profile?.studyMajors) ? profile.studyMajors : [];
  if (studyMajors.length > 0) {
    return studyMajors
      .filter((item) => item?.code && item?.name)
      .map((item) => ({
        code: item.code,
        name: item.name
      }));
  }

  if (profile?.major) {
    return [
      {
        code: profile.majorCode || profile.major,
        name: profile.major
      }
    ];
  }

  return [];
};

const isPeriodActiveNow = (period) => {
  if (!period || period.status !== 'active') {
    return false;
  }

  const now = Date.now();
  return new Date(period.startAt).getTime() <= now && new Date(period.endAt).getTime() >= now;
};

export default function StudentRegistration() {
  const { token } = useAuth();
  const { data, reload } = useOutletContext();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [processingSectionId, setProcessingSectionId] = useState('');
  const [selectedMajorCode, setSelectedMajorCode] = useState('');

  const majorOptions = useMemo(() => resolveMajorOptions(data.profile), [data.profile]);
  const activeRegistrationPeriod = (data.registrationPeriods || []).find(isPeriodActiveNow) || null;
  const isRegistrationOpen = Boolean(activeRegistrationPeriod);

  useEffect(() => {
    if (majorOptions.length === 1) {
      setSelectedMajorCode(majorOptions[0].code);
      return;
    }

    setSelectedMajorCode((current) =>
      current && majorOptions.some((item) => item.code === current) ? current : ''
    );
  }, [majorOptions]);

  const visibleEnrollments = (data.myEnrollments || []).filter(
    (enrollment) => enrollment.status !== 'cancelled'
  );
  const activeEnrollments = visibleEnrollments.filter((enrollment) =>
    isActiveEnrollment(enrollment.status)
  );
  const registeredCredits =
    data.tuition?.totalCredits ??
    activeEnrollments.reduce((sum, enrollment) => sum + (enrollment.section?.course?.credits || 0), 0);
  const maxCredits = data.profile?.creditLimits?.maxCredits || 24;

  const enrollmentBySectionId = new Map();
  visibleEnrollments.forEach((enrollment) => {
    const sectionId = getId(enrollment.section);
    if (!sectionId) {
      return;
    }

    const existing = enrollmentBySectionId.get(sectionId);
    if (
      !existing ||
      getEnrollmentPriority(enrollment.status) >= getEnrollmentPriority(existing.status)
    ) {
      enrollmentBySectionId.set(sectionId, enrollment);
    }
  });

  const filteredSections = useMemo(() => {
    if (!selectedMajorCode) {
      return [];
    }

    return (data.availableSections || []).filter((section) => {
      const eligibleMajorCodes = (section.course?.eligibleMajorCodes || []).map((item) =>
        String(item).trim().toUpperCase()
      );

      if (eligibleMajorCodes.length === 0) {
        return true;
      }

      return eligibleMajorCodes.includes(String(selectedMajorCode).trim().toUpperCase());
    });
  }, [data.availableSections, selectedMajorCode]);

  const closePreview = () => {
    setPreview(null);
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRegister = async (sectionId) => {
    setMessage('');
    setError('');
    setPreview(null);
    setProcessingSectionId(sectionId);

    try {
      const response = await studentApi.previewRegistration(token, sectionId);
      const report = response.report;

      if (report?.eligible) {
        await studentApi.registerSection(token, sectionId);
        setPreview(report);
        setMessage('Đăng ký học phần thành công.');
        scrollToTop();
        await reload();
        return;
      }

      setPreview(report);
      scrollToTop();
    } catch (requestError) {
      setError(requestError.message || 'Không thể đăng ký học phần.');
    } finally {
      setProcessingSectionId('');
    }
  };

  const handleCancel = async (enrollmentId, sectionId) => {
    setMessage('');
    setError('');
    setPreview(null);
    setProcessingSectionId(sectionId);

    try {
      await studentApi.cancelEnrollment(token, enrollmentId);
      setMessage('Đã hủy đăng ký học phần.');
      scrollToTop();
      await reload();
    } catch (requestError) {
      setError(requestError.message || 'Không thể hủy đăng ký học phần.');
    } finally {
      setProcessingSectionId('');
    }
  };

  const handleToggleRegistration = async (sectionId) => {
    const enrollment = enrollmentBySectionId.get(sectionId);
    if (isActiveEnrollment(enrollment?.status)) {
      await handleCancel(enrollment.id || enrollment._id, sectionId);
      return;
    }

    await handleRegister(sectionId);
  };

  const failedChecks = (preview?.checks || []).filter((check) => !check.passed);

  if (!isRegistrationOpen) {
    return (
      <div className="page-stack">
        <section className="hero-banner hero-banner--compact">
          <div>
            <span className="hero-chip">Đăng ký học phần</span>
            <h1>Đăng ký môn học kỳ {data.activeSemester?.name}</h1>
          </div>
        </section>

        <div className="form-error">Hiện không trong đợt đăng ký học phần.</div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Đăng ký học phần</span>
          <h1>Đăng ký môn học kỳ {data.activeSemester?.name}</h1>
          <p>
            Đợt hiện tại: {activeRegistrationPeriod?.name} ({formatDate(activeRegistrationPeriod?.startAt)} -{' '}
            {formatDate(activeRegistrationPeriod?.endAt)})
          </p>
        </div>
      </section>

      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      {preview ? (
        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>
                {preview.eligible ? 'Đủ điều kiện đăng ký học phần' : 'Không thể đăng ký học phần'}
              </h3>
              <p>
                {preview.section?.code} · {preview.section?.course?.name}
              </p>
            </div>
            <div className="inline-actions">
              <button className="ghost-button" type="button" onClick={closePreview}>
                Đóng
              </button>
            </div>
          </header>

          <div className="registration-review">
            {preview.eligible ? (
              <div className="form-success">
                Đủ điều kiện đăng ký học phần {preview.section?.code} · {preview.section?.course?.name}.
                Hệ thống đã lưu đăng ký ngay cho bạn.
              </div>
            ) : (
              <div className="form-error">
                <strong>Bạn đang vướng ở các mục sau:</strong>
                <ul className="summary-list">
                  {failedChecks.length > 0
                    ? failedChecks.map((check) => (
                        <li key={check.key}>
                          <strong>{check.title}:</strong> {check.detail}
                        </li>
                      ))
                    : preview.reasons.map((reason, index) => (
                        <li key={`${preview.section?.id || 'preview'}-${index}`}>{reason}</li>
                      ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      ) : null}

      <section className="panel">
        <header className="panel__header">
          <div>
            <h3>Tổng quan đăng ký</h3>
            <p>Chọn ngành học trước, sau đó tick để đăng ký ngay hoặc bỏ tick để hủy.</p>
          </div>
        </header>
        <div className="stack-form">
          <div className="form-grid">
            <label>
              <span>Ngành học đang đăng ký</span>
              <select
                value={selectedMajorCode}
                onChange={(event) => setSelectedMajorCode(event.target.value)}
              >
                {majorOptions.length > 1 ? <option value="">Chọn ngành học</option> : null}
                {majorOptions.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="tag-list">
            <span className="tag-card">Tín chỉ đã đăng ký: {registeredCredits}/{maxCredits}</span>
            <span className="tag-card">Học phần đang hiệu lực: {activeEnrollments.length}</span>
            <span className="tag-card">Lớp phù hợp ngành đã chọn: {filteredSections.length}</span>
          </div>
        </div>
      </section>

      <DataTable
        title="Học phần đang mở"
        description="Hệ thống chỉ hiển thị học phần mở phù hợp với ngành học bạn đã chọn."
        rows={selectedMajorCode ? filteredSections : []}
        searchable
        searchKeys={['code', 'course.code', 'course.name', 'lecturer.fullName', 'status']}
        emptyMessage={
          selectedMajorCode
            ? 'Không có học phần mở phù hợp với ngành đã chọn.'
            : 'Hãy chọn ngành học để xem danh sách học phần mở.'
        }
        getRowClassName={(row) => {
          const enrollment = enrollmentBySectionId.get(getId(row));
          return isActiveEnrollment(enrollment?.status) ? 'data-table__row--registered' : '';
        }}
        columns={[
          { label: 'Mã HP', key: 'code' },
          {
            label: 'Môn học',
            key: 'course.name',
            render: (row) => `${row.course.code} · ${row.course.name}`
          },
          { label: 'TC', key: 'course.credits' },
          { label: 'Lịch học', key: 'schedule', render: (row) => formatSchedule(row.schedule) },
          { label: 'Giảng viên', key: 'lecturer.fullName' },
          {
            label: 'Chỗ trống',
            key: 'capacity',
            render: (row) => `${row.currentEnrollment}/${row.capacity}`
          },
          { label: 'Trạng thái', key: 'status', type: 'status' },
          {
            label: '',
            key: 'actions',
            render: (row) => {
              const rowId = getId(row);
              const isProcessing = processingSectionId === rowId;
              const enrollment = enrollmentBySectionId.get(rowId);
              const isRegistered = isActiveEnrollment(enrollment?.status);
              const checkboxClassName = [
                'table-button',
                'registration-checkbox',
                isRegistered ? 'registration-checkbox--checked' : '',
                isProcessing ? 'registration-checkbox--processing' : ''
              ]
                .filter(Boolean)
                .join(' ');
              const buttonLabel = isProcessing
                ? isRegistered
                  ? 'Đang hủy...'
                  : 'Đang đăng ký...'
                : isRegistered
                  ? 'Đã chọn'
                  : 'Chọn';

              return (
                <button
                  className={checkboxClassName}
                  onClick={() => handleToggleRegistration(rowId)}
                  type="button"
                  disabled={Boolean(processingSectionId)}
                  aria-pressed={isRegistered}
                  title={
                    isRegistered
                      ? 'Bỏ tick để hủy đăng ký nếu còn trong thời hạn.'
                      : 'Tick để đăng ký ngay nếu đủ điều kiện.'
                  }
                >
                  <span className="registration-checkbox__box" aria-hidden="true">
                    {isProcessing ? '…' : isRegistered ? '✓' : ''}
                  </span>
                  <span className="registration-checkbox__label">{buttonLabel}</span>
                </button>
              );
            }
          }
        ]}
      />

      <DataTable
        title="Kết quả đăng ký hiện tại"
        description="Danh sách này được cập nhật đồng bộ theo thao tác tick hoặc bỏ tick ở bảng trên."
        rows={activeEnrollments}
        searchable
        searchKeys={['section.code', 'section.course.name', 'status']}
        columns={[
          {
            label: 'Học phần',
            key: 'section.code',
            render: (row) => `${row.section.code} · ${row.section.course.name}`
          },
          { label: 'TC', key: 'section.course.credits' },
          {
            label: 'Lịch học',
            key: 'section.schedule',
            render: (row) => formatSchedule(row.section.schedule)
          },
          { label: 'Trạng thái', key: 'status', type: 'status' }
        ]}
      />
    </div>
  );
}

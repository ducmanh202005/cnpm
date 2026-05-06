import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { studentApi } from '../../api/portalApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatSchedule } from '../../utils/formatters.js';

const getId = (item) => item?.id || item?._id || '';
const isActiveEnrollment = (status) => ['approved', 'pending'].includes(status);

export default function StudentRegistration() {
  const { token } = useAuth();
  const { data, reload } = useOutletContext();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [processingSectionId, setProcessingSectionId] = useState('');

  const visibleEnrollments = (data.myEnrollments || []).filter(
    (enrollment) => enrollment.status !== 'cancelled'
  );

  const enrollmentBySectionId = new Map();
  visibleEnrollments.forEach((enrollment) => {
    const sectionId = getId(enrollment.section);
    if (!sectionId) {
      return;
    }

    const existing = enrollmentBySectionId.get(sectionId);
    const existingPriority =
      existing?.status === 'approved' ? 3 : existing?.status === 'pending' ? 2 : 1;
    const nextPriority =
      enrollment.status === 'approved' ? 3 : enrollment.status === 'pending' ? 2 : 1;

    if (!existing || nextPriority >= existingPriority) {
      enrollmentBySectionId.set(sectionId, enrollment);
    }
  });

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

  const handleCancel = async (enrollmentId) => {
    setMessage('');
    setError('');

    try {
      await studentApi.cancelEnrollment(token, enrollmentId);
      setMessage('Đã hủy đăng ký học phần.');
      await reload();
    } catch (requestError) {
      setError(requestError.message || 'Không thể hủy đăng ký học phần.');
    }
  };

  const failedChecks = (preview?.checks || []).filter((check) => !check.passed);

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Đăng ký học phần</span>
          <h1>Đăng ký môn học kỳ {data.activeSemester?.name}</h1>
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
                Đủ điều kiện đăng ký học phần {preview.section?.code} ·{' '}
                {preview.section?.course?.name}. Hệ thống đã đăng ký thành công cho bạn.
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

      <DataTable
        title="Học phần đang mở"
        description="Hệ thống sẽ tự kiểm tra điều kiện trước khi đăng ký."
        rows={data.availableSections}
        searchable
        searchKeys={['code', 'course.code', 'course.name', 'lecturer.fullName', 'status']}
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

              return (
                <button
                  className={checkboxClassName}
                  onClick={() => handleRegister(rowId)}
                  type="button"
                  disabled={Boolean(processingSectionId) || isRegistered}
                >
                  <span className="registration-checkbox__box" aria-hidden="true">
                    {isProcessing ? '…' : isRegistered ? '✓' : ''}
                  </span>
                  <span className="registration-checkbox__label">
                    {isProcessing ? 'Đang xử lý...' : isRegistered ? 'Đã đăng ký' : 'Đăng ký'}
                  </span>
                </button>
              );
            }
          }
        ]}
      />

      <DataTable
        title="Xem kết quả đăng ký"
        description="Theo dõi các học phần đang còn hiệu lực."
        rows={visibleEnrollments}
        searchable
        searchKeys={['section.code', 'section.course.name', 'status']}
        columns={[
          {
            label: 'Học phần',
            key: 'section.code',
            render: (row) => `${row.section.code} · ${row.section.course.name}`
          },
          {
            label: 'Lịch học',
            key: 'section.schedule',
            render: (row) => formatSchedule(row.section.schedule)
          },
          { label: 'Trạng thái', key: 'status', type: 'status' },
          {
            label: '',
            key: 'action',
            render: (row) =>
              row.status === 'approved' ? (
                <button
                  className="table-button table-button--ghost"
                  onClick={() => handleCancel(row.id || row._id)}
                  type="button"
                >
                  Hủy
                </button>
              ) : (
                '--'
              )
          }
        ]}
      />
    </div>
  );
}

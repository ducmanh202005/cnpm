import { useEffect, useState } from 'react';
import DataTable from '../components/common/DataTable.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { financeApi, studentApi, workspaceApi } from '../api/portalApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDate, formatDateTime, formatSchedule } from '../utils/formatters.js';

export default function StudentWorkspacePage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'vnpay' });

  const loadWorkspace = async () => {
    setLoading(true);
    try {
      const response = await workspaceApi.student(token);
      setData(response);
      setPaymentForm((current) => ({
        ...current,
        amount: response.tuition?.outstandingAmount || ''
      }));
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải dữ liệu sinh viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [token]);

  const handleRegister = async (sectionId) => {
    setMessage('');
    setError('');
    try {
      await studentApi.registerSection(token, sectionId);
      setMessage('Đăng ký học phần thành công.');
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleCancel = async (enrollmentId) => {
    setMessage('');
    setError('');
    try {
      await studentApi.cancelEnrollment(token, enrollmentId);
      setMessage('Đã huỷ đăng ký học phần.');
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handlePayment = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await financeApi.createStudentPayment(token, {
        liabilityId: data.tuition.id || data.tuition._id,
        amount: Number(paymentForm.amount),
        method: paymentForm.method
      });
      setMessage('Thanh toán học phí thành công.');
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (loading || !data) {
    return <LoadingState label="Đang tải cổng sinh viên..." />;
  }

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Cổng sinh viên</span>
          <h1>{data.profile.fullName}</h1>
          <p>
            {data.profile.studentCode} · {data.profile.major} · {data.profile.administrativeClass}
          </p>
        </div>
        <div className="hero-aside">
          <span className="hero-badge">Miễn giảm: {data.profile.policy?.discountRate || 0}%</span>
          <span className="hero-badge">Tài khoản NH: {data.profile.bankAccount}</span>
        </div>
      </section>

      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <div className="stats-grid">
        <StatCard eyebrow="Học kỳ hiện tại" title="Tín chỉ đã đăng ký" value={data.tuition?.totalCredits || 0} />
        <StatCard eyebrow="Học phí" title="Tổng phải nộp" value={formatCurrency(data.tuition?.amountDue || 0)} />
        <StatCard eyebrow="Thanh toán" title="Đã nộp" value={formatCurrency(data.tuition?.amountPaid || 0)} />
        <StatCard eyebrow="Công nợ" title="Còn nợ" value={formatCurrency(data.tuition?.outstandingAmount || 0)} />
      </div>

      <section className="panel">
        <header className="panel__header">
          <div>
            <h3>Đợt đăng ký đang mở</h3>
            <p>Học kỳ {data.activeSemester?.name} - {data.activeSemester?.academicYear}</p>
          </div>
        </header>
        <div className="tag-list">
          {data.registrationPeriods.map((item) => (
            <span key={item.id || item._id} className="tag-card">
              {item.name}: {formatDate(item.startAt)} - {formatDate(item.endAt)}
            </span>
          ))}
        </div>
      </section>

      <DataTable
        title="Học phần mở"
        description="Bạn có thể đăng ký trực tiếp từ danh sách này."
        rows={data.availableSections}
        searchable
        searchKeys={['code', 'course.code', 'course.name', 'lecturer.fullName', 'status']}
        columns={[
          { label: 'Mã học phần', key: 'code' },
          {
            label: 'Môn học',
            key: 'course.name',
            render: (row) => `${row.course.code} · ${row.course.name}`
          },
          { label: 'Tín chỉ', key: 'course.credits' },
          {
            label: 'Lịch học',
            key: 'schedule',
            render: (row) => formatSchedule(row.schedule)
          },
          { label: 'Giảng viên', key: 'lecturer.fullName' },
          {
            label: 'Chỗ trống',
            key: 'capacity',
            render: (row) => `${row.currentEnrollment}/${row.capacity}`
          },
          { label: 'Trạng thái', key: 'status', type: 'status' },
          {
            label: 'Tác vụ',
            key: 'actions',
            render: (row) => (
              <button
                className="table-button"
                onClick={() => handleRegister(row.id || row._id)}
                type="button"
              >
                Đăng ký
              </button>
            )
          }
        ]}
      />

      <DataTable
        title="Đăng ký của tôi"
        description="Theo dõi các học phần đã đăng ký hoặc đã huỷ."
        rows={data.myEnrollments}
        searchable
        searchKeys={['section.code', 'section.course.name', 'status']}
        columns={[
          {
            label: 'Học phần',
            key: 'section.code',
            render: (row) => `${row.section.code} · ${row.section.course.name}`
          },
          { label: 'Đăng ký lúc', key: 'registeredAt', render: (row) => formatDateTime(row.registeredAt) },
          { label: 'Lịch học', key: 'section.schedule', render: (row) => formatSchedule(row.section.schedule) },
          { label: 'Trạng thái', key: 'status', type: 'status' },
          {
            label: 'Tác vụ',
            key: 'action',
            render: (row) =>
              row.status === 'approved' ? (
                <button
                  className="table-button table-button--ghost"
                  onClick={() => handleCancel(row.id || row._id)}
                  type="button"
                >
                  Huỷ
                </button>
              ) : (
                '--'
              )
          }
        ]}
      />

      <DataTable
        title="Lịch thi"
        description="Tổng hợp lịch thi của các học phần đã đăng ký."
        rows={data.examSchedule || []}
        searchable
        searchKeys={['sectionCode', 'courseName', 'room', 'sessionLabel', 'format']}
        columns={[
          { label: 'Học phần', key: 'sectionCode' },
          { label: 'Môn học', key: 'courseName' },
          { label: 'Ngày thi', key: 'examDate', render: (row) => formatDateTime(row.examDate), sortValue: (row) => row.examDate },
          { label: 'Ca thi', key: 'sessionLabel' },
          { label: 'Phòng thi', key: 'room' },
          { label: 'Hình thức', key: 'format' }
        ]}
      />

      <div className="content-grid content-grid--two">
        <DataTable
          title="Chi tiết học phí"
          description="Học phí được tính từ số tín chỉ đã đăng ký và chính sách miễn giảm."
          rows={data.tuition?.lines || []}
          columns={[
            { label: 'Môn học', key: 'courseName' },
            { label: 'Tín chỉ', key: 'credits' },
            { label: 'Đơn giá', key: 'unitPrice', render: (row) => formatCurrency(row.unitPrice) },
            { label: 'Thành tiền', key: 'amount', render: (row) => formatCurrency(row.amount) }
          ]}
        />

        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>Thanh toán học phí</h3>
              <p>Hạn nộp: {formatDate(data.tuition?.dueDate)}</p>
            </div>
          </header>

          <div className="detail-card">
            <div className="detail-card__row">
              <span>Phải nộp</span>
              <strong>{formatCurrency(data.tuition?.amountDue || 0)}</strong>
            </div>
            <div className="detail-card__row">
              <span>Đã nộp</span>
              <strong>{formatCurrency(data.tuition?.amountPaid || 0)}</strong>
            </div>
            <div className="detail-card__row">
              <span>Còn nợ</span>
              <strong>{formatCurrency(data.tuition?.outstandingAmount || 0)}</strong>
            </div>
          </div>

          <form className="stack-form" onSubmit={handlePayment}>
            <label>
              <span>Số tiền thanh toán</span>
              <input
                type="number"
                min="0"
                value={paymentForm.amount}
                onChange={(event) =>
                  setPaymentForm((current) => ({ ...current, amount: event.target.value }))
                }
              />
            </label>
            <label>
              <span>Phương thức</span>
              <select
                value={paymentForm.method}
                onChange={(event) =>
                  setPaymentForm((current) => ({ ...current, method: event.target.value }))
                }
              >
                <option value="vnpay">VNPay</option>
                <option value="momo">MoMo</option>
                <option value="bank_transfer">Chuyển khoản</option>
              </select>
            </label>

            <button className="primary-button" type="submit">
              Thanh toán ngay
            </button>
          </form>
        </section>
      </div>

      <DataTable
        title="Lịch sử giao dịch"
        rows={data.payments}
        searchable
        searchKeys={['referenceCode', 'method', 'status']}
        columns={[
          { label: 'Mã tham chiếu', key: 'referenceCode' },
          { label: 'Số tiền', key: 'amount', render: (row) => formatCurrency(row.amount) },
          { label: 'Phương thức', key: 'method' },
          { label: 'Thời gian', key: 'createdAt', render: (row) => formatDateTime(row.createdAt) },
          { label: 'Trạng thái', key: 'status', type: 'status' }
        ]}
      />

      <DataTable
        title="Biên lai điện tử"
        rows={data.receipts || []}
        searchable
        searchKeys={['receiptNumber', 'content', 'semester.name']}
        columns={[
          { label: 'Số biên lai', key: 'receiptNumber' },
          { label: 'Học kỳ', key: 'semester.name', render: (row) => `${row.semester.name} ${row.semester.academicYear}` },
          { label: 'Số tiền', key: 'amount', render: (row) => formatCurrency(row.amount) },
          { label: 'Nội dung thu', key: 'content' },
          { label: 'Ngày phát hành', key: 'issuedAt', render: (row) => formatDateTime(row.issuedAt), sortValue: (row) => row.issuedAt }
        ]}
      />
    </div>
  );
}

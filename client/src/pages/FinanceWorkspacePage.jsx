import { useEffect, useMemo, useState } from 'react';
import DataTable from '../components/common/DataTable.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { catalogApi, financeApi, workspaceApi } from '../api/portalApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters.js';

export default function FinanceWorkspacePage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [rateForm, setRateForm] = useState({
    name: '',
    academicYear: '2025-2026',
    semester: '',
    programType: 'standard',
    pricePerCredit: 800000,
    effectiveFrom: '2026-05-01'
  });
  const [paymentForm, setPaymentForm] = useState({
    liabilityId: '',
    amount: '',
    method: 'bank_transfer'
  });

  const loadWorkspace = async () => {
    setLoading(true);
    try {
      const [workspace, semesterResponse] = await Promise.all([
        workspaceApi.finance(token),
        catalogApi.listSemesters(token)
      ]);
      setData(workspace);
      setSemesters(semesterResponse.items || []);
      setRateForm((current) => ({
        ...current,
        semester: current.semester || semesterResponse.items?.[0]?.id || semesterResponse.items?.[0]?._id || ''
      }));
      setPaymentForm((current) => ({
        ...current,
        liabilityId: current.liabilityId || workspace.liabilities?.[0]?.id || workspace.liabilities?.[0]?._id || '',
        amount: current.amount || workspace.liabilities?.[0]?.outstandingAmount || ''
      }));
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải workspace tài chính.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [token]);

  const selectedLiability = useMemo(
    () => data?.liabilities?.find((item) => (item.id || item._id) === paymentForm.liabilityId),
    [data, paymentForm.liabilityId]
  );

  const handleCreateRate = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await financeApi.createRate(token, {
        ...rateForm,
        pricePerCredit: Number(rateForm.pricePerCredit)
      });
      setMessage('Đã thêm biểu phí mới.');
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleManualPayment = async (event) => {
    event.preventDefault();
    if (!selectedLiability) {
      return;
    }

    setMessage('');
    setError('');
    try {
      await financeApi.recordManualPayment(token, {
        liabilityId: selectedLiability.id || selectedLiability._id,
        studentId: selectedLiability.student.id || selectedLiability.student._id,
        amount: Number(paymentForm.amount),
        method: paymentForm.method
      });
      setMessage('Đã ghi nhận giao dịch thanh toán.');
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (loading || !data) {
    return <LoadingState label="Đang tải workspace tài chính..." />;
  }

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Phòng tài chính</span>
          <h1>Theo dõi công nợ, thanh toán, biên lai và doanh thu</h1>
          <p>Bộ tài chính này tập trung vào nghĩa vụ học phí, đối soát thanh toán và báo cáo thu học phí.</p>
        </div>
      </section>

      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <div className="stats-grid">
        <StatCard eyebrow="Đã thu" title="Tổng thu" value={formatCurrency(data.spotlight.collected)} />
        <StatCard eyebrow="Công nợ" title="Còn lại" value={formatCurrency(data.spotlight.outstanding)} />
        <StatCard eyebrow="Quá hạn" title="Hồ sơ" value={data.spotlight.overdueCount} />
        <StatCard eyebrow="Biên lai" title="Đã phát hành" value={data.receipts?.length || 0} />
      </div>

      <div className="content-grid content-grid--two">
        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>Tạo biểu phí</h3>
              <p>Áp dụng đơn giá học phí theo học kỳ và chương trình đào tạo.</p>
            </div>
          </header>
          <form className="stack-form" onSubmit={handleCreateRate}>
            <div className="form-grid">
              <label>
                <span>Tên biểu phí</span>
                <input value={rateForm.name} onChange={(event) => setRateForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label>
                <span>Năm học</span>
                <input value={rateForm.academicYear} onChange={(event) => setRateForm((current) => ({ ...current, academicYear: event.target.value }))} />
              </label>
              <label>
                <span>Học kỳ</span>
                <select value={rateForm.semester} onChange={(event) => setRateForm((current) => ({ ...current, semester: event.target.value }))}>
                  {semesters.map((item) => (
                    <option key={item.id || item._id} value={item.id || item._id}>
                      {item.name} - {item.academicYear}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Đơn giá / tín chỉ</span>
                <input type="number" value={rateForm.pricePerCredit} onChange={(event) => setRateForm((current) => ({ ...current, pricePerCredit: event.target.value }))} />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Lưu biểu phí
            </button>
          </form>
        </section>

        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>Ghi nhận thanh toán thủ công</h3>
              <p>Phù hợp cho giao dịch xác nhận tại quầy hoặc đối soát ngoài hệ thống.</p>
            </div>
          </header>
          <form className="stack-form" onSubmit={handleManualPayment}>
            <label>
              <span>Chon nghia vu hoc phi</span>
              <select
                value={paymentForm.liabilityId}
                onChange={(event) =>
                  setPaymentForm((current) => ({
                    ...current,
                    liabilityId: event.target.value,
                    amount:
                      data.liabilities.find((item) => (item.id || item._id) === event.target.value)
                        ?.outstandingAmount || ''
                  }))
                }
              >
                {data.liabilities.map((item) => (
                  <option key={item.id || item._id} value={item.id || item._id}>
                    {item.student.studentCode} - {item.semester.name} ({formatCurrency(item.outstandingAmount)})
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>So tien</span>
              <input type="number" value={paymentForm.amount} onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))} />
            </label>
            <label>
              <span>Phuong thuc</span>
              <select value={paymentForm.method} onChange={(event) => setPaymentForm((current) => ({ ...current, method: event.target.value }))}>
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="cash">Tiền mặt</option>
                <option value="momo">MoMo</option>
                <option value="vnpay">VNPay</option>
              </select>
            </label>
            <button className="primary-button" type="submit">
              Ghi nhận giao dịch
            </button>
          </form>
        </section>
      </div>

      <DataTable
        title="Cong no hoc phi"
        rows={data.liabilities}
        searchable
        searchKeys={['student.studentCode', 'student.fullName', 'semester.name', 'status']}
        columns={[
          { label: 'Sinh vien', key: 'student.studentCode', render: (row) => `${row.student.studentCode} · ${row.student.fullName}` },
          { label: 'Hoc ky', key: 'semester.name', render: (row) => `${row.semester.name} ${row.semester.academicYear}` },
          { label: 'Phai nop', key: 'amountDue', render: (row) => formatCurrency(row.amountDue) },
          { label: 'Da nop', key: 'amountPaid', render: (row) => formatCurrency(row.amountPaid) },
          { label: 'Con no', key: 'outstandingAmount', render: (row) => formatCurrency(row.outstandingAmount) },
          { label: 'Han nop', key: 'dueDate', render: (row) => formatDate(row.dueDate), sortValue: (row) => row.dueDate },
          { label: 'Trang thai', key: 'status', type: 'status' }
        ]}
      />

      <div className="content-grid content-grid--two">
        <DataTable
          title="Doanh thu theo hoc ky"
          rows={data.reports?.revenueBySemester || []}
          searchable
          searchKeys={['semesterName']}
          columns={[
            { label: 'Hoc ky', key: 'semesterName' },
            { label: 'So bien lai', key: 'receiptCount' },
            { label: 'Tong thu', key: 'amount', render: (row) => formatCurrency(row.amount) }
          ]}
        />

        <DataTable
          title="Thu theo phuong thuc"
          rows={data.reports?.paymentMethodBreakdown || []}
          searchable
          searchKeys={['method']}
          columns={[
            { label: 'Phuong thuc', key: 'method' },
            { label: 'So giao dich', key: 'transactionCount' },
            { label: 'Tong so tien', key: 'amount', render: (row) => formatCurrency(row.amount) }
          ]}
        />
      </div>

      <div className="content-grid content-grid--two">
        <DataTable
          title="Bieu phi"
          rows={data.rates}
          searchable
          searchKeys={['name', 'semester.name', 'programType']}
          columns={[
            { label: 'Ten', key: 'name' },
            { label: 'Hoc ky', key: 'semester.name', render: (row) => `${row.semester.name} ${row.academicYear}` },
            { label: 'Loai CTDT', key: 'programType' },
            { label: 'Don gia', key: 'pricePerCredit', render: (row) => formatCurrency(row.pricePerCredit) }
          ]}
        />

        <DataTable
          title="Giao dich gan day"
          rows={data.payments}
          searchable
          searchKeys={['referenceCode', 'student.studentCode', 'method', 'status']}
          columns={[
            { label: 'Ref', key: 'referenceCode' },
            { label: 'Sinh vien', key: 'student.studentCode' },
            { label: 'So tien', key: 'amount', render: (row) => formatCurrency(row.amount) },
            { label: 'Thoi gian', key: 'createdAt', render: (row) => formatDateTime(row.createdAt), sortValue: (row) => row.createdAt },
            { label: 'Trang thai', key: 'status', type: 'status' }
          ]}
        />
      </div>

      <DataTable
        title="Bien lai dien tu"
        rows={data.receipts || []}
        searchable
        searchKeys={['receiptNumber', 'student.studentCode', 'semester.name', 'content']}
        columns={[
          { label: 'So bien lai', key: 'receiptNumber' },
          { label: 'Sinh vien', key: 'student.studentCode', render: (row) => `${row.student.studentCode} · ${row.student.fullName}` },
          { label: 'Hoc ky', key: 'semester.name', render: (row) => `${row.semester.name} ${row.semester.academicYear}` },
          { label: 'So tien', key: 'amount', render: (row) => formatCurrency(row.amount) },
          { label: 'Ngay phat hanh', key: 'issuedAt', render: (row) => formatDateTime(row.issuedAt), sortValue: (row) => row.issuedAt }
        ]}
      />
    </div>
  );
}

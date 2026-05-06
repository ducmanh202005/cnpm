import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { financeApi } from '../../api/portalApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters.js';

export default function StudentTuition() {
  const { token } = useAuth();
  const { data, reload } = useOutletContext();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    amount: data.tuition?.outstandingAmount || '',
    method: 'vnpay'
  });

  const handlePayment = async (event) => {
    event.preventDefault();
    setMessage(''); setError('');
    try {
      await financeApi.createStudentPayment(token, {
        liabilityId: data.tuition.id || data.tuition._id,
        amount: Number(paymentForm.amount),
        method: paymentForm.method
      });
      setMessage('Thanh toán học phí thành công.');
      await reload();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Học phí</span>
          <h1>Học phí kỳ {data.activeSemester?.name}</h1>
          <p>Tra cứu công nợ, thanh toán và xem biên lai điện tử.</p>
        </div>
      </section>

      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <div className="content-grid content-grid--two">
        <DataTable
          title="Chi tiết học phí"
          description="Học phí tính theo số tín chỉ và chính sách miễn giảm."
          rows={data.tuition?.lines || []}
          columns={[
            { label: 'Môn học', key: 'courseName' },
            { label: 'TC', key: 'credits' },
            { label: 'Đơn giá', key: 'unitPrice', render: (row) => formatCurrency(row.unitPrice) },
            { label: 'Thành tiền', key: 'amount', render: (row) => formatCurrency(row.amount) }
          ]}
        />

        <section className="panel">
          <header className="panel__header">
            <div><h3>Thanh toán học phí</h3><p>Hạn nộp: {formatDate(data.tuition?.dueDate)}</p></div>
          </header>
          <div className="detail-card">
            <div className="detail-card__row"><span>Phải nộp</span><strong>{formatCurrency(data.tuition?.amountDue || 0)}</strong></div>
            <div className="detail-card__row"><span>Đã nộp</span><strong>{formatCurrency(data.tuition?.amountPaid || 0)}</strong></div>
            <div className="detail-card__row"><span>Còn nợ</span><strong>{formatCurrency(data.tuition?.outstandingAmount || 0)}</strong></div>
          </div>
          <form className="stack-form" onSubmit={handlePayment}>
            <label><span>Số tiền</span>
              <input type="number" min="0" value={paymentForm.amount} onChange={(e) => setPaymentForm((c) => ({ ...c, amount: e.target.value }))} />
            </label>
            <label><span>Phương thức</span>
              <select value={paymentForm.method} onChange={(e) => setPaymentForm((c) => ({ ...c, method: e.target.value }))}>
                <option value="vnpay">VNPay</option>
                <option value="momo">MoMo</option>
                <option value="bank_transfer">Chuyển khoản</option>
              </select>
            </label>
            <button className="primary-button" type="submit">Thanh toán ngay</button>
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
          { label: 'Thời gian', key: 'createdAt', render: (row) => formatDateTime(row.createdAt), sortValue: (row) => row.createdAt },
          { label: 'Trạng thái', key: 'status', type: 'status' }
        ]}
      />

      <DataTable
        title="Biên lai điện tử"
        rows={data.receipts || []}
        searchable
        searchKeys={['receiptNumber', 'content']}
        columns={[
          { label: 'Số biên lai', key: 'receiptNumber' },
          { label: 'Học kỳ', key: 'semester.name', render: (row) => `${row.semester.name} ${row.semester.academicYear}` },
          { label: 'Số tiền', key: 'amount', render: (row) => formatCurrency(row.amount) },
          { label: 'Nội dung', key: 'content' },
          { label: 'Ngày PH', key: 'issuedAt', render: (row) => formatDateTime(row.issuedAt), sortValue: (row) => row.issuedAt }
        ]}
      />
    </div>
  );
}

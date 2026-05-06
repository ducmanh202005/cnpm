import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { financeApi } from '../../api/portalApi.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export default function FinancePayments() {
  const { data, reload, token } = useOutletContext();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ liabilityId: data.liabilities?.[0]?.id || data.liabilities?.[0]?._id || '', amount: data.liabilities?.[0]?.outstandingAmount || '', method: 'bank_transfer' });

  const selected = useMemo(() => data?.liabilities?.find((i) => (i.id || i._id) === form.liabilityId), [data, form.liabilityId]);

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!selected) return; setMessage(''); setError('');
    try {
      await financeApi.recordManualPayment(token, { liabilityId: selected.id || selected._id, studentId: selected.student.id || selected.student._id, amount: Number(form.amount), method: form.method });
      setMessage('Đã ghi nhận giao dịch thanh toán.'); await reload();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact"><div><span className="hero-chip">Thanh toán</span><h1>Ghi nhận và đối soát giao dịch</h1></div></section>
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <section className="panel">
        <header className="panel__header"><div><h3>Ghi nhận thanh toán thủ công</h3></div></header>
        <form className="stack-form" onSubmit={handleSubmit}>
          <label><span>Chọn nghĩa vụ</span>
            <select value={form.liabilityId} onChange={(e) => setForm((c) => ({ ...c, liabilityId: e.target.value, amount: data.liabilities.find((i) => (i.id || i._id) === e.target.value)?.outstandingAmount || '' }))}>
              {data.liabilities.map((i) => <option key={i.id || i._id} value={i.id || i._id}>{i.student.studentCode} - {i.semester.name} ({formatCurrency(i.outstandingAmount)})</option>)}
            </select>
          </label>
          <div className="form-grid">
            <label><span>Số tiền</span><input type="number" value={form.amount} onChange={(e) => setForm((c) => ({ ...c, amount: e.target.value }))} /></label>
            <label><span>Phương thức</span>
              <select value={form.method} onChange={(e) => setForm((c) => ({ ...c, method: e.target.value }))}>
                <option value="bank_transfer">Chuyển khoản</option><option value="cash">Tiền mặt</option><option value="momo">MoMo</option><option value="vnpay">VNPay</option>
              </select>
            </label>
          </div>
          <button className="primary-button" type="submit">Ghi nhận giao dịch</button>
        </form>
      </section>

      <div className="content-grid content-grid--two">
        <DataTable title="Giao dịch gần đây" rows={data.payments} searchable searchKeys={['referenceCode', 'student.studentCode', 'method', 'status']}
          columns={[{ label: 'Ref', key: 'referenceCode' }, { label: 'SV', key: 'student.studentCode' }, { label: 'Số tiền', key: 'amount', render: (r) => formatCurrency(r.amount) }, { label: 'Thời gian', key: 'createdAt', render: (r) => formatDateTime(r.createdAt) }, { label: 'TT', key: 'status', type: 'status' }]} />
        <DataTable title="Doanh thu theo học kỳ" rows={data.reports?.revenueBySemester || []} columns={[{ label: 'Học kỳ', key: 'semesterName' }, { label: 'Số BL', key: 'receiptCount' }, { label: 'Tổng thu', key: 'amount', render: (r) => formatCurrency(r.amount) }]} />
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { financeApi } from '../../api/portalApi.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export default function FinancePayments() {
  const { data, reload, token } = useOutletContext();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    liabilityId: data.liabilities?.[0]?.id || data.liabilities?.[0]?._id || '',
    amount: data.liabilities?.[0]?.outstandingAmount || '',
    method: 'bank_transfer'
  });

  const selected = useMemo(
    () => data?.liabilities?.find((item) => (item.id || item._id) === form.liabilityId),
    [data, form.liabilityId]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selected) {
      return;
    }

    setMessage('');
    setError('');

    try {
      await financeApi.recordManualPayment(token, {
        liabilityId: selected.id || selected._id,
        studentId: selected.student.id || selected.student._id,
        amount: Number(form.amount),
        method: form.method
      });
      setMessage('Đã ghi nhận giao dịch thanh toán.');
      await reload();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Thanh toán</span>
          <h1>Ghi nhận và đối soát giao dịch</h1>
        </div>
      </section>

      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <section className="panel">
        <header className="panel__header">
          <div>
            <h3>Ghi nhận thanh toán thủ công</h3>
          </div>
        </header>

        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            <span>Chọn nghĩa vụ</span>
            <select
              value={form.liabilityId}
              onChange={(event) =>
                setForm((current) => ({
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

          <div className="form-grid">
            <label>
              <span>Số tiền</span>
              <input
                type="number"
                value={form.amount}
                onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              />
            </label>

            <label>
              <span>Phương thức</span>
              <select
                value={form.method}
                onChange={(event) => setForm((current) => ({ ...current, method: event.target.value }))}
              >
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="cash">Tiền mặt</option>
                <option value="momo">MoMo</option>
                <option value="vnpay">VNPay</option>
              </select>
            </label>
          </div>

          <button className="primary-button" type="submit">
            Ghi nhận giao dịch
          </button>
        </form>
      </section>

      <DataTable
        title="Giao dịch gần đây"
        rows={data.payments}
        searchable
        searchKeys={['referenceCode', 'student.studentCode', 'method', 'status']}
        columns={[
          { label: 'Ref', key: 'referenceCode' },
          { label: 'SV', key: 'student.studentCode' },
          { label: 'Số tiền', key: 'amount', render: (row) => formatCurrency(row.amount) },
          { label: 'Thời gian', key: 'createdAt', render: (row) => formatDateTime(row.createdAt) },
          { label: 'TT', key: 'status', type: 'status' }
        ]}
      />
    </div>
  );
}

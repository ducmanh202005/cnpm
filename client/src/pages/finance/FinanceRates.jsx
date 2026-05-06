import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { financeApi } from '../../api/portalApi.js';
import { formatCurrency } from '../../utils/formatters.js';

export default function FinanceRates() {
  const { data, semesters, reload, token } = useOutletContext();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', academicYear: '2025-2026', semester: semesters[0]?.id || semesters[0]?._id || '', programType: 'standard', pricePerCredit: 800000, effectiveFrom: '2026-05-01' });

  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage(''); setError('');
    try { await financeApi.createRate(token, { ...form, pricePerCredit: Number(form.pricePerCredit) }); setMessage('Đã thêm biểu phí mới.'); await reload(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact"><div><span className="hero-chip">Biểu phí</span><h1>Đơn giá học phí theo học kỳ</h1></div></section>
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}
      <section className="panel">
        <header className="panel__header"><div><h3>Tạo biểu phí</h3></div></header>
        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label><span>Tên biểu phí</span><input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} /></label>
            <label><span>Năm học</span><input value={form.academicYear} onChange={(e) => setForm((c) => ({ ...c, academicYear: e.target.value }))} /></label>
            <label><span>Học kỳ</span><select value={form.semester} onChange={(e) => setForm((c) => ({ ...c, semester: e.target.value }))}>{semesters.map((s) => <option key={s.id || s._id} value={s.id || s._id}>{s.name} - {s.academicYear}</option>)}</select></label>
            <label><span>Đơn giá / tín chỉ</span><input type="number" value={form.pricePerCredit} onChange={(e) => setForm((c) => ({ ...c, pricePerCredit: e.target.value }))} /></label>
          </div>
          <button className="primary-button" type="submit">Lưu biểu phí</button>
        </form>
      </section>
      <DataTable title="Danh sách biểu phí" rows={data.rates} searchable searchKeys={['name', 'semester.name', 'programType']}
        columns={[{ label: 'Tên', key: 'name' }, { label: 'Học kỳ', key: 'semester.name', render: (r) => `${r.semester.name} ${r.academicYear}` }, { label: 'Loại CTĐT', key: 'programType' }, { label: 'Đơn giá', key: 'pricePerCredit', render: (r) => formatCurrency(r.pricePerCredit) }]} />
    </div>
  );
}

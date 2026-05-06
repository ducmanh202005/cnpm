import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { catalogApi } from '../../api/portalApi.js';
import { formatDate } from '../../utils/formatters.js';

const getId = (item) => item?.id || item?._id || '';

export default function AcademicSemesters() {
  const { data, reload, token } = useOutletContext();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const semesters = data.semesters || [];

  const [semForm, setSemForm] = useState({ code: '', name: 'Học kỳ 1', academicYear: '2026-2027', startDate: '2026-09-03', endDate: '2027-01-15', registrationDeadline: '2026-08-25', paymentDeadline: '2026-09-15', status: 'planning' });
  const [periodForm, setPeriodForm] = useState({ name: '', semester: getId(semesters[0]), startAt: '2026-08-15T08:00', endAt: '2026-08-25T23:59', targetAudience: 'Toàn trường', status: 'active' });

  const handleSemester = async (e) => {
    e.preventDefault(); setMessage(''); setError('');
    try {
      await catalogApi.createSemester(token, { ...semForm, startDate: new Date(semForm.startDate).toISOString(), endDate: new Date(semForm.endDate).toISOString(), registrationDeadline: new Date(semForm.registrationDeadline).toISOString(), paymentDeadline: new Date(semForm.paymentDeadline).toISOString() });
      setMessage('Đã tạo học kỳ mới.');
      await reload();
    } catch (err) { setError(err.message); }
  };

  const handlePeriod = async (e) => {
    e.preventDefault(); setMessage(''); setError('');
    try {
      await catalogApi.createRegistrationPeriod(token, { ...periodForm, startAt: new Date(periodForm.startAt).toISOString(), endAt: new Date(periodForm.endAt).toISOString() });
      setMessage('Đã tạo đợt đăng ký mới.');
      setPeriodForm((c) => ({ ...c, name: '' }));
      await reload();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div><span className="hero-chip">Học kỳ & Đợt đăng ký</span><h1>Quản lý kỳ học và mở đợt đăng ký</h1></div>
      </section>
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <div className="content-grid content-grid--two">
        <section className="panel">
          <header className="panel__header"><div><h3>Tạo học kỳ</h3></div></header>
          <form className="stack-form" onSubmit={handleSemester}>
            <div className="form-grid">
              <label><span>Mã HK</span><input value={semForm.code} onChange={(e) => setSemForm((c) => ({ ...c, code: e.target.value }))} /></label>
              <label><span>Tên</span><input value={semForm.name} onChange={(e) => setSemForm((c) => ({ ...c, name: e.target.value }))} /></label>
              <label><span>Năm học</span><input value={semForm.academicYear} onChange={(e) => setSemForm((c) => ({ ...c, academicYear: e.target.value }))} /></label>
              <label><span>Trạng thái</span>
                <select value={semForm.status} onChange={(e) => setSemForm((c) => ({ ...c, status: e.target.value }))}>
                  <option value="planning">Kế hoạch</option><option value="registration_open">Mở ĐK</option><option value="in_session">Đang học</option><option value="closed">Đã đóng</option>
                </select>
              </label>
              <label><span>Bắt đầu</span><input type="date" value={semForm.startDate} onChange={(e) => setSemForm((c) => ({ ...c, startDate: e.target.value }))} /></label>
              <label><span>Kết thúc</span><input type="date" value={semForm.endDate} onChange={(e) => setSemForm((c) => ({ ...c, endDate: e.target.value }))} /></label>
              <label><span>Hạn ĐK</span><input type="date" value={semForm.registrationDeadline} onChange={(e) => setSemForm((c) => ({ ...c, registrationDeadline: e.target.value }))} /></label>
              <label><span>Hạn HP</span><input type="date" value={semForm.paymentDeadline} onChange={(e) => setSemForm((c) => ({ ...c, paymentDeadline: e.target.value }))} /></label>
            </div>
            <button className="primary-button" type="submit">Tạo học kỳ</button>
          </form>
        </section>

        <section className="panel">
          <header className="panel__header"><div><h3>Tạo đợt đăng ký</h3></div></header>
          <form className="stack-form" onSubmit={handlePeriod}>
            <div className="form-grid">
              <label><span>Tên đợt</span><input value={periodForm.name} onChange={(e) => setPeriodForm((c) => ({ ...c, name: e.target.value }))} /></label>
              <label><span>Học kỳ</span>
                <select value={periodForm.semester} onChange={(e) => setPeriodForm((c) => ({ ...c, semester: e.target.value }))}>
                  {semesters.map((s) => <option key={getId(s)} value={getId(s)}>{s.name} - {s.academicYear}</option>)}
                </select>
              </label>
              <label><span>Bắt đầu</span><input type="datetime-local" value={periodForm.startAt} onChange={(e) => setPeriodForm((c) => ({ ...c, startAt: e.target.value }))} /></label>
              <label><span>Kết thúc</span><input type="datetime-local" value={periodForm.endAt} onChange={(e) => setPeriodForm((c) => ({ ...c, endAt: e.target.value }))} /></label>
            </div>
            <button className="primary-button" type="submit">Tạo đợt ĐK</button>
          </form>
        </section>
      </div>

      <div className="content-grid content-grid--two">
        <DataTable title="Đợt đăng ký" rows={data.registrationPeriods || []} searchable searchKeys={['name', 'semester.name', 'status']}
          columns={[
            { label: 'Tên đợt', key: 'name' }, { label: 'Học kỳ', key: 'semester.name' },
            { label: 'Bắt đầu', key: 'startAt', render: (row) => formatDate(row.startAt) },
            { label: 'Kết thúc', key: 'endAt', render: (row) => formatDate(row.endAt) },
            { label: 'TT', key: 'status', type: 'status' }
          ]}
        />
        <DataTable title="Tổng hợp đăng ký" rows={data.registrationSummary || []} searchable searchKeys={['sectionCode', 'courseName', 'lecturerName']}
          columns={[
            { label: 'HP', key: 'sectionCode' }, { label: 'Môn', key: 'courseName' },
            { label: 'GV', key: 'lecturerName' }, { label: 'Lấp đầy', key: 'fillRate', render: (row) => `${row.fillRate}%` },
            { label: 'TT', key: 'status', type: 'status' }
          ]}
        />
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { catalogApi } from '../../api/portalApi.js';

export default function AcademicCourses() {
  const { data, reload, token } = useOutletContext();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ code: '', name: '', credits: 3, theoryCredits: 2, practiceCredits: 1, courseType: 'required', faculty: 'Công nghệ thông tin', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage(''); setError('');
    try {
      await catalogApi.createCourse(token, form);
      setMessage('Đã lưu môn học.');
      setForm({ code: '', name: '', credits: 3, theoryCredits: 2, practiceCredits: 1, courseType: 'required', faculty: 'Công nghệ thông tin', description: '' });
      await reload();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div><span className="hero-chip">Quản lý môn học</span><h1>Danh mục môn học trong chương trình đào tạo</h1></div>
      </section>
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <section className="panel">
        <header className="panel__header"><div><h3>Thêm môn học mới</h3></div></header>
        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label><span>Mã môn</span><input value={form.code} onChange={(e) => setForm((c) => ({ ...c, code: e.target.value }))} /></label>
            <label><span>Tên môn</span><input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} /></label>
            <label><span>Tín chỉ</span><input type="number" value={form.credits} onChange={(e) => setForm((c) => ({ ...c, credits: e.target.value }))} /></label>
            <label><span>Loại môn</span>
              <select value={form.courseType} onChange={(e) => setForm((c) => ({ ...c, courseType: e.target.value }))}>
                <option value="required">Bắt buộc</option><option value="elective">Tự chọn</option>
              </select>
            </label>
          </div>
          <label><span>Mô tả</span><textarea rows="2" value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} /></label>
          <button className="primary-button" type="submit">Lưu môn học</button>
        </form>
      </section>

      <DataTable title="Danh sách môn học" rows={data.courses || []} searchable searchKeys={['code', 'name', 'faculty', 'courseType']}
        columns={[
          { label: 'Mã', key: 'code' }, { label: 'Tên môn', key: 'name' },
          { label: 'TC', key: 'credits' }, { label: 'Loại', key: 'courseType' },
          { label: 'Khoa', key: 'faculty' }
        ]}
      />
    </div>
  );
}

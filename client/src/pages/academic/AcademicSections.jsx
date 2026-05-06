import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { catalogApi } from '../../api/portalApi.js';
import { formatSchedule, formatDate } from '../../utils/formatters.js';

const getId = (item) => item?.id || item?._id || '';

export default function AcademicSections() {
  const { data, reload, token } = useOutletContext();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const courses = data.courses || [];
  const semesters = data.semesters || [];
  const lecturers = data.lecturers || [];
  const sections = data.sections || [];

  const [form, setForm] = useState({
    code: '', course: getId(courses[0]), semester: getId(semesters[0]),
    lecturer: getId(lecturers[0]), capacity: 50, minCapacity: 15, room: '',
    dayOfWeek: 2, sessionLabel: 'Sáng', startPeriod: 1, periodCount: 3
  });

  const [updateForm, setUpdateForm] = useState({
    sectionId: '', lecturer: '', status: 'open', cancelReason: '',
    examDate: '', examRoom: '', examSessionLabel: 'Sáng', durationMinutes: 90, examFormat: 'Tự luận'
  });

  const handleCreate = async (e) => {
    e.preventDefault(); setMessage(''); setError('');
    try {
      await catalogApi.createSection(token, {
        code: form.code, course: form.course, semester: form.semester,
        lecturer: form.lecturer || undefined, capacity: Number(form.capacity),
        minCapacity: Number(form.minCapacity), room: form.room, status: 'open',
        schedule: [{ dayOfWeek: Number(form.dayOfWeek), sessionLabel: form.sessionLabel, startPeriod: Number(form.startPeriod), periodCount: Number(form.periodCount), room: form.room }]
      });
      setMessage('Đã mở học phần mới.');
      await reload();
    } catch (err) { setError(err.message); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); if (!updateForm.sectionId) return;
    setMessage(''); setError('');
    try {
      await catalogApi.updateSection(token, updateForm.sectionId, {
        lecturer: updateForm.lecturer || '', status: updateForm.status,
        cancelReason: updateForm.cancelReason,
        exam: updateForm.examDate ? {
          examDate: new Date(updateForm.examDate).toISOString(),
          room: updateForm.examRoom, sessionLabel: updateForm.examSessionLabel,
          durationMinutes: Number(updateForm.durationMinutes), format: updateForm.examFormat
        } : null
      });
      setMessage('Đã cập nhật học phần.');
      await reload();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div><span className="hero-chip">Quản lý học phần</span><h1>Mở lớp, cập nhật và xếp lịch thi</h1></div>
      </section>
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <div className="content-grid content-grid--two">
        <section className="panel">
          <header className="panel__header"><div><h3>Mở học phần mới</h3></div></header>
          <form className="stack-form" onSubmit={handleCreate}>
            <div className="form-grid">
              <label><span>Mã HP</span><input value={form.code} onChange={(e) => setForm((c) => ({ ...c, code: e.target.value }))} /></label>
              <label><span>Môn học</span>
                <select value={form.course} onChange={(e) => setForm((c) => ({ ...c, course: e.target.value }))}>
                  {courses.map((c) => <option key={getId(c)} value={getId(c)}>{c.code} - {c.name}</option>)}
                </select>
              </label>
              <label><span>Học kỳ</span>
                <select value={form.semester} onChange={(e) => setForm((c) => ({ ...c, semester: e.target.value }))}>
                  {semesters.map((s) => <option key={getId(s)} value={getId(s)}>{s.name} - {s.academicYear}</option>)}
                </select>
              </label>
              <label><span>Giảng viên</span>
                <select value={form.lecturer} onChange={(e) => setForm((c) => ({ ...c, lecturer: e.target.value }))}>
                  <option value="">-- Chưa phân công --</option>
                  {lecturers.map((l) => <option key={getId(l)} value={getId(l)}>{l.lecturerCode} - {l.fullName}</option>)}
                </select>
              </label>
              <label><span>Sĩ số tối đa</span><input type="number" value={form.capacity} onChange={(e) => setForm((c) => ({ ...c, capacity: e.target.value }))} /></label>
              <label><span>Phòng học</span><input value={form.room} onChange={(e) => setForm((c) => ({ ...c, room: e.target.value }))} /></label>
            </div>
            <button className="primary-button" type="submit">Mở học phần</button>
          </form>
        </section>

        <section className="panel">
          <header className="panel__header"><div><h3>Cập nhật học phần</h3></div></header>
          <form className="stack-form" onSubmit={handleUpdate}>
            <label><span>Chọn học phần</span>
              <select value={updateForm.sectionId} onChange={(e) => setUpdateForm((c) => ({ ...c, sectionId: e.target.value }))}>
                <option value="">-- Chọn --</option>
                {sections.map((s) => <option key={getId(s)} value={getId(s)}>{s.code} - {s.course?.name}</option>)}
              </select>
            </label>
            <div className="form-grid">
              <label><span>Trạng thái</span>
                <select value={updateForm.status} onChange={(e) => setUpdateForm((c) => ({ ...c, status: e.target.value }))}>
                  <option value="open">Mở</option><option value="closed">Đóng</option><option value="cancelled">Huỷ</option>
                </select>
              </label>
              <label><span>Ngày thi</span><input type="datetime-local" value={updateForm.examDate} onChange={(e) => setUpdateForm((c) => ({ ...c, examDate: e.target.value }))} /></label>
              <label><span>Phòng thi</span><input value={updateForm.examRoom} onChange={(e) => setUpdateForm((c) => ({ ...c, examRoom: e.target.value }))} /></label>
              <label><span>Hình thức thi</span><input value={updateForm.examFormat} onChange={(e) => setUpdateForm((c) => ({ ...c, examFormat: e.target.value }))} /></label>
            </div>
            <button className="primary-button" type="submit">Cập nhật</button>
          </form>
        </section>
      </div>

      <DataTable title="Danh sách học phần" rows={sections} searchable
        searchKeys={['code', 'course.name', 'lecturer.fullName', 'room', 'status']}
        columns={[
          { label: 'Mã HP', key: 'code' },
          { label: 'Môn học', key: 'course.name' },
          { label: 'GV', key: 'lecturer.fullName' },
          { label: 'Lịch', key: 'schedule', render: (row) => formatSchedule(row.schedule) },
          { label: 'Sĩ số', key: 'capacity', render: (row) => `${row.currentEnrollment}/${row.capacity}` },
          { label: 'TT', key: 'status', type: 'status' }
        ]}
      />
    </div>
  );
}

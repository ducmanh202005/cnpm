import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { catalogApi } from '../../api/portalApi.js';
import { formatSchedule } from '../../utils/formatters.js';

const getId = (item) => item?.id || item?._id || '';

const toScheduleForm = (section) => {
  const slot = section?.schedule?.[0] || {};
  return {
    sectionId: getId(section),
    dayOfWeek: slot.dayOfWeek || 2,
    sessionLabel: slot.sessionLabel || 'Sáng',
    startPeriod: slot.startPeriod || 1,
    periodCount: slot.periodCount || 3,
    room: slot.room || section?.room || '',
    weeks: slot.weeks || '1-15',
    note: ''
  };
};

export default function AcademicSchedule() {
  const { data, reload, token } = useOutletContext();
  const sections = data.sections || [];
  const [selectedId, setSelectedId] = useState(getId(sections[0]));
  const selectedSection = useMemo(
    () => sections.find((section) => getId(section) === selectedId) || sections[0],
    [sections, selectedId]
  );
  const [form, setForm] = useState(() => toScheduleForm(selectedSection));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectSection = (sectionId) => {
    const nextSection = sections.find((section) => getId(section) === sectionId);
    setSelectedId(sectionId);
    setForm(toScheduleForm(nextSection));
    setMessage('');
    setError('');
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.sectionId) return;

    setMessage('');
    setError('');
    try {
      await catalogApi.updateSection(token, form.sectionId, {
        room: form.room,
        schedule: [{
          dayOfWeek: Number(form.dayOfWeek),
          sessionLabel: form.sessionLabel,
          startPeriod: Number(form.startPeriod),
          periodCount: Number(form.periodCount),
          room: form.room,
          weeks: form.weeks
        }]
      });
      setMessage('Đã cập nhật lịch học và đồng bộ thời khóa biểu.');
      await reload();
    } catch (err) {
      setError(err.message || 'Không thể cập nhật lịch học.');
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Quản lý lịch học</span>
          <h1>Xếp lịch, đổi phòng và cập nhật tuần học</h1>
          <p>Theo tài liệu nghiệp vụ: kiểm soát thứ học, ca học, phòng học và lịch của học phần.</p>
        </div>
      </section>

      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <section className="panel">
        <header className="panel__header">
          <div>
            <h3>Cập nhật lịch học phần</h3>
            <p>Khi lưu, hệ thống cập nhật lại lịch học của sinh viên và lịch dạy của giảng viên.</p>
          </div>
        </header>
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            <span>Học phần</span>
            <select value={form.sectionId} onChange={(event) => selectSection(event.target.value)}>
              <option value="">-- Chọn học phần --</option>
              {sections.map((section) => (
                <option key={getId(section)} value={getId(section)}>
                  {section.code} - {section.course?.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <label>
              <span>Thứ</span>
              <select value={form.dayOfWeek} onChange={(event) => updateField('dayOfWeek', event.target.value)}>
                <option value={2}>Thứ 2</option>
                <option value={3}>Thứ 3</option>
                <option value={4}>Thứ 4</option>
                <option value={5}>Thứ 5</option>
                <option value={6}>Thứ 6</option>
                <option value={7}>Thứ 7</option>
                <option value={8}>Chủ nhật</option>
              </select>
            </label>
            <label>
              <span>Ca học</span>
              <select value={form.sessionLabel} onChange={(event) => updateField('sessionLabel', event.target.value)}>
                <option value="Sáng">Sáng</option>
                <option value="Chiều">Chiều</option>
                <option value="Tối">Tối</option>
              </select>
            </label>
            <label>
              <span>Tiết bắt đầu</span>
              <input type="number" min="1" value={form.startPeriod} onChange={(event) => updateField('startPeriod', event.target.value)} />
            </label>
            <label>
              <span>Số tiết</span>
              <input type="number" min="1" value={form.periodCount} onChange={(event) => updateField('periodCount', event.target.value)} />
            </label>
            <label>
              <span>Phòng học</span>
              <input value={form.room} onChange={(event) => updateField('room', event.target.value)} placeholder="VD: A2-301" />
            </label>
            <label>
              <span>Tuần học</span>
              <input value={form.weeks} onChange={(event) => updateField('weeks', event.target.value)} placeholder="VD: 1-15" />
            </label>
          </div>
          <label>
            <span>Ghi chú thay đổi</span>
            <textarea value={form.note} onChange={(event) => updateField('note', event.target.value)} placeholder="VD: đổi phòng do bảo trì, xếp lịch bù..." />
          </label>
          <button className="primary-button" type="submit" disabled={!form.sectionId}>Lưu lịch học</button>
        </form>
      </section>

      <DataTable
        title="Lịch học hiện có"
        rows={sections}
        searchable
        searchKeys={['code', 'course.name', 'lecturer.fullName', 'room']}
        columns={[
          { label: 'Mã HP', key: 'code' },
          { label: 'Môn học', key: 'course.name' },
          { label: 'Giảng viên', key: 'lecturer.fullName' },
          { label: 'Lịch', key: 'schedule', render: (row) => formatSchedule(row.schedule) || '--' },
          { label: 'Phòng', key: 'room', render: (row) => row.room || row.schedule?.[0]?.room || '--' },
          { label: 'Tuần', key: 'weeks', render: (row) => row.schedule?.[0]?.weeks || '--' },
          { label: 'Trạng thái', key: 'status', type: 'status' }
        ]}
      />
    </div>
  );
}

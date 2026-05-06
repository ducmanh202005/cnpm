import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { formatSchedule } from '../../utils/formatters.js';

export default function StudentSchedule() {
  const { data } = useOutletContext();

  // Build schedule from approved enrollments
  const scheduleRows = (data.myEnrollments || [])
    .filter((e) => e.status === 'approved')
    .map((e) => ({
      id: e.id || e._id,
      sectionCode: e.section.code,
      courseName: e.section.course.name,
      credits: e.section.course.credits,
      schedule: formatSchedule(e.section.schedule),
      room: e.section.room || e.section.schedule?.[0]?.room || '--',
      lecturer: e.section.lecturer?.fullName || '--'
    }));

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Thời khoá biểu</span>
          <h1>Lịch học kỳ {data.activeSemester?.name}</h1>
          <p>Tổng hợp lịch học từ các học phần đã đăng ký thành công.</p>
        </div>
      </section>

      <DataTable
        title="Lịch học hàng tuần"
        rows={scheduleRows}
        searchable
        searchKeys={['sectionCode', 'courseName', 'room', 'lecturer']}
        columns={[
          { label: 'Mã HP', key: 'sectionCode' },
          { label: 'Môn học', key: 'courseName' },
          { label: 'TC', key: 'credits' },
          { label: 'Lịch học', key: 'schedule' },
          { label: 'Phòng', key: 'room' },
          { label: 'Giảng viên', key: 'lecturer' }
        ]}
      />
    </div>
  );
}

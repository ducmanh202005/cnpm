import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { formatSchedule } from '../../utils/formatters.js';

export default function LecturerSections() {
  const { data } = useOutletContext();
  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact"><div><span className="hero-chip">Học phần phân công</span><h1>Danh sách lớp được phân công giảng dạy</h1></div></section>
      <DataTable title="Học phần được phân công" rows={data.sections} searchable searchKeys={['code', 'course.name', 'semester.name']}
        columns={[
          { label: 'Mã HP', key: 'code' }, { label: 'Môn học', key: 'course.name' },
          { label: 'Học kỳ', key: 'semester.name', render: (r) => `${r.semester.name} ${r.semester.academicYear}` },
          { label: 'Lịch dạy', key: 'schedule', render: (r) => formatSchedule(r.schedule) },
          { label: 'Phòng', key: 'room' },
          { label: 'Sĩ số', key: 'capacity', render: (r) => `${r.currentEnrollment}/${r.capacity}` }
        ]} />
    </div>
  );
}

import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { formatDateTime } from '../../utils/formatters.js';

export default function LecturerExams() {
  const { data } = useOutletContext();
  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact"><div><span className="hero-chip">Lịch thi</span><h1>Lịch thi các học phần phân công</h1></div></section>
      <DataTable title="Lịch thi" rows={data.examSchedule || []} searchable searchKeys={['sectionCode', 'courseName', 'room']}
        columns={[
          { label: 'HP', key: 'sectionCode' }, { label: 'Môn', key: 'courseName' },
          { label: 'Ngày thi', key: 'examDate', render: (r) => formatDateTime(r.examDate), sortValue: (r) => r.examDate },
          { label: 'Ca', key: 'sessionLabel' }, { label: 'Phòng', key: 'room' }, { label: 'Hình thức', key: 'format' }
        ]} />
    </div>
  );
}

import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { formatDateTime } from '../../utils/formatters.js';

export default function StudentExams() {
  const { data } = useOutletContext();
  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Lịch thi</span>
          <h1>Lịch thi kỳ {data.activeSemester?.name}</h1>
          <p>Tổng hợp lịch thi của các học phần đã đăng ký.</p>
        </div>
      </section>

      <DataTable
        title="Danh sách ca thi"
        rows={data.examSchedule || []}
        searchable
        searchKeys={['sectionCode', 'courseName', 'room', 'sessionLabel', 'format']}
        columns={[
          { label: 'Mã HP', key: 'sectionCode' },
          { label: 'Môn học', key: 'courseName' },
          { label: 'Ngày thi', key: 'examDate', render: (row) => formatDateTime(row.examDate), sortValue: (row) => row.examDate },
          { label: 'Ca thi', key: 'sessionLabel' },
          { label: 'Phòng thi', key: 'room' },
          { label: 'Hình thức', key: 'format' }
        ]}
      />
    </div>
  );
}

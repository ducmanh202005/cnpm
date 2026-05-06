import { useEffect, useState } from 'react';
import DataTable from '../components/common/DataTable.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { workspaceApi } from '../api/portalApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDateTime, formatSchedule } from '../utils/formatters.js';

export default function LecturerWorkspacePage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setError('');
      try {
        const response = await workspaceApi.lecturer(token);
        if (active) {
          setData(response);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || 'Không thể tải workspace giảng viên.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [token]);

  if (loading || !data) {
    if (!loading && error) {
      return (
        <div className="page-stack">
          <div className="form-error">{error}</div>
        </div>
      );
    }
    return <LoadingState label="Đang tải workspace giảng viên..." />;
  }

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Giảng viên</span>
          <h1>{data.lecturer.fullName}</h1>
          <p>
            {data.lecturer.lecturerCode} · {data.lecturer.department} · {data.lecturer.degree}
          </p>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard eyebrow="Phân công" title="Học phần" value={data.teachingSummary?.totalSections || 0} />
        <StatCard eyebrow="Sinh viên" title="Roster" value={data.teachingSummary?.totalStudents || 0} />
        <StatCard eyebrow="Thi cử" title="Lịch thi sắp tới" value={data.teachingSummary?.upcomingExams || 0} />
        <StatCard eyebrow="Tín chỉ" title="Tổng tín chỉ" value={data.teachingSummary?.totalCredits || 0} />
      </div>

      <DataTable
        title="Học phần được phân công"
        rows={data.sections}
        searchable
        searchKeys={['code', 'course.name', 'semester.name', 'status']}
        columns={[
          { label: 'Mã học phần', key: 'code' },
          { label: 'Môn học', key: 'course.name' },
          { label: 'Học kỳ', key: 'semester.name', render: (row) => `${row.semester.name} ${row.semester.academicYear}` },
          { label: 'Lịch dạy', key: 'schedule', render: (row) => formatSchedule(row.schedule) },
          { label: 'Phòng', key: 'room' },
          { label: 'Sĩ số', key: 'capacity', render: (row) => `${row.currentEnrollment}/${row.capacity}` }
        ]}
      />

      <div className="content-grid content-grid--two">
        <DataTable
          title="Lịch thi"
          rows={data.examSchedule || []}
          searchable
          searchKeys={['sectionCode', 'courseName', 'room', 'sessionLabel', 'format']}
          columns={[
            { label: 'Học phần', key: 'sectionCode' },
            { label: 'Môn học', key: 'courseName' },
            { label: 'Ngày thi', key: 'examDate', render: (row) => formatDateTime(row.examDate), sortValue: (row) => row.examDate },
            { label: 'Ca thi', key: 'sessionLabel' },
            { label: 'Phòng thi', key: 'room' },
            { label: 'Hình thức', key: 'format' }
          ]}
        />

        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>Danh sách lớp học phần</h3>
              <p>Roster gồm kèm số ghế thi nếu học phần đã được xếp lịch thi.</p>
            </div>
          </header>
          <div className="roster-grid">
            {data.rosters.map((roster) => (
              <article key={roster.sectionId} className="roster-card">
                <h4>{roster.sectionCode}</h4>
                <p>{roster.courseName}</p>
                <ul>
                  {roster.students.map((student) => (
                    <li key={student.id || student._id}>
                      <strong>{student.studentCode}</strong>
                      <span>
                        {student.fullName}
                        {student.seatNumber ? ` · SBD ${student.seatNumber}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

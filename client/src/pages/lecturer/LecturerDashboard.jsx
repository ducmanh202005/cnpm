import { useOutletContext } from 'react-router-dom';
import StatCard from '../../components/common/StatCard.jsx';

export default function LecturerDashboard() {
  const { data } = useOutletContext();
  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div><span className="hero-chip">Giảng viên</span><h1>{data.lecturer.fullName}</h1><p>{data.lecturer.lecturerCode} · {data.lecturer.department} · {data.lecturer.degree}</p></div>
      </section>
      <div className="stats-grid">
        <StatCard eyebrow="Phân công" title="Học phần" value={data.teachingSummary?.totalSections || 0} />
        <StatCard eyebrow="Sinh viên" title="Tổng SV" value={data.teachingSummary?.totalStudents || 0} />
        <StatCard eyebrow="Thi cử" title="Lịch thi sắp tới" value={data.teachingSummary?.upcomingExams || 0} />
        <StatCard eyebrow="Tín chỉ" title="Tổng TC" value={data.teachingSummary?.totalCredits || 0} />
      </div>
    </div>
  );
}

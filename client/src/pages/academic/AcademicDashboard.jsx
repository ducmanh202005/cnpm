import { useOutletContext } from 'react-router-dom';
import StatCard from '../../components/common/StatCard.jsx';

export default function AcademicDashboard() {
  const { data } = useOutletContext();
  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Phòng đào tạo</span>
          <h1>Quản lý môn học, học phần, sinh viên và lịch thi</h1>
          <p>Tổng quan nghiệp vụ đào tạo trong kỳ hiện tại.</p>
        </div>
      </section>
      <div className="stats-grid">
        <StatCard eyebrow="Học phần" title="Đang mở" value={data.spotlight.openSections} />
        <StatCard eyebrow="Học phần" title="Đầy sĩ số" value={data.spotlight.fullSections} />
        <StatCard eyebrow="Học vụ" title="SV cần xử lý" value={data.spotlight.onHoldStudents} />
        <StatCard eyebrow="Nhân sự" title="GV active" value={data.spotlight.activeLecturers} />
      </div>
    </div>
  );
}

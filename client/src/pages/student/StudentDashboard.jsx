import { useOutletContext } from 'react-router-dom';
import StatCard from '../../components/common/StatCard.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export default function StudentDashboard() {
  const { data } = useOutletContext();
  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Cổng sinh viên</span>
          <h1>Xin chào, {data.profile.fullName}</h1>
          <p>{data.profile.studentCode} · {data.profile.major} · {data.profile.administrativeClass}</p>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard eyebrow="Học kỳ hiện tại" title="Tín chỉ đăng ký" value={data.tuition?.totalCredits || 0} />
        <StatCard eyebrow="Học phí" title="Tổng phải nộp" value={formatCurrency(data.tuition?.amountDue || 0)} />
        <StatCard eyebrow="Thanh toán" title="Đã nộp" value={formatCurrency(data.tuition?.amountPaid || 0)} />
        <StatCard eyebrow="Công nợ" title="Còn nợ" value={formatCurrency(data.tuition?.outstandingAmount || 0)} />
      </div>

      <section className="panel">
        <header className="panel__header">
          <div><h3>Đợt đăng ký đang mở</h3><p>Học kỳ {data.activeSemester?.name} - {data.activeSemester?.academicYear}</p></div>
        </header>
        <div className="tag-list">
          {data.registrationPeriods.map((item) => (
            <span key={item.id || item._id} className="tag-card">
              {item.name}: {formatDate(item.startAt)} - {formatDate(item.endAt)}
            </span>
          ))}
        </div>
      </section>

      <section className="panel">
        <header className="panel__header">
          <div><h3>Thông báo quan trọng</h3><p>Các mốc hạn cần lưu ý trong kỳ hiện tại.</p></div>
        </header>
        <div className="timeline-list">
          <article className="timeline-item">
            <div className="timeline-item__dot" />
            <div>
              <strong>Hạn đăng ký học phần</strong>
              <p>{formatDate(data.activeSemester?.registrationDeadline)}</p>
            </div>
          </article>
          <article className="timeline-item">
            <div className="timeline-item__dot" />
            <div>
              <strong>Hạn nộp học phí</strong>
              <p>{formatDate(data.tuition?.dueDate)}</p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

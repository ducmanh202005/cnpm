import { useOutletContext } from 'react-router-dom';
import StatCard from '../../components/common/StatCard.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function FinanceDashboard() {
  const { data } = useOutletContext();
  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div><span className="hero-chip">Phòng tài chính</span><h1>Theo dõi công nợ, thanh toán và doanh thu</h1></div>
      </section>
      <div className="stats-grid">
        <StatCard eyebrow="Đã thu" title="Tổng thu" value={formatCurrency(data.spotlight.collected)} />
        <StatCard eyebrow="Công nợ" title="Còn lại" value={formatCurrency(data.spotlight.outstanding)} />
        <StatCard eyebrow="Quá hạn" title="Hồ sơ" value={data.spotlight.overdueCount} />
        <StatCard eyebrow="Biên lai" title="Đã phát hành" value={data.receipts?.length || 0} />
      </div>
    </div>
  );
}

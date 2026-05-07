import { useOutletContext } from 'react-router-dom';
import StatCard from '../../components/common/StatCard.jsx';

export default function AdminDashboard() {
  const { data } = useOutletContext();
  const total = data.users.length;
  const locked = data.users.filter((item) => item.accountStatus === 'locked').length;
  const admins = data.users.filter((item) => item.roles.includes('admin')).length;

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Quản trị</span>
          <h1>Quản lý tài khoản và phân quyền hệ thống</h1>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard eyebrow="Tài khoản" title="Tổng số" value={total} />
        <StatCard eyebrow="Bảo mật" title="Đang bị khóa" value={locked} />
        <StatCard eyebrow="RBAC" title="Tài khoản admin" value={admins} />
      </div>
    </div>
  );
}

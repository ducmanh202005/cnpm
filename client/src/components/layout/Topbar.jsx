import { Link } from 'react-router-dom';
import { formatRoles } from '../../utils/formatters.js';

const getInitials = (value = '') =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((item) => item[0])
    .join('')
    .toUpperCase() || 'CH';

export default function Topbar({ user, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar__main">
        <div className="topbar__brand">
          <img className="topbar__logo" src="/ptit-logo.png" alt="PTIT" />
          <div className="topbar__meta">
            <h2>HỆ THỐNG QUẢN LÝ ĐĂNG KÝ TÍN CHỈ VÀ HỌC PHÍ</h2>
            <p className="topbar__eyebrow">Học viện Công nghệ Bưu chính Viễn thông</p>
          </div>
        </div>

        <div className="topbar__actions">
          <div className="topbar__profile">
            <div className="topbar__avatar">{getInitials(user?.displayName)}</div>
            <div className="topbar__identity">
              <span className="topbar__role">{user?.displayName || 'Người dùng'}</span>
              <span className="topbar__email">{formatRoles(user?.roles || [])}</span>
            </div>
          </div>
          <button className="topbar__notification" type="button" title="Thông báo">
            🔔
          </button>
          <Link className="ghost-button" to="/app/account">
            Tài khoản
          </Link>
          <button className="ghost-button" onClick={onLogout} type="button">
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}

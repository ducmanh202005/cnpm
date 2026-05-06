import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingState from '../components/common/LoadingState.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { authApi, dashboardApi } from '../api/portalApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { hasAnyRole } from '../utils/appConfig.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

const MODULES = [
  {
    title: 'Cổng sinh viên',
    note: 'Đăng ký học phần, lịch học, lịch thi, học phí và biên lai.',
    roles: ['student'],
    to: '/app/student'
  },
  {
    title: 'Đào tạo',
    note: 'Quản lý môn học, học phần, học kỳ và đợt đăng ký.',
    roles: ['academic_office', 'admin'],
    to: '/app/academic'
  },
  {
    title: 'Tài chính',
    note: 'Biểu phí, công nợ, giao dịch thanh toán và doanh thu.',
    roles: ['finance_office', 'admin'],
    to: '/app/finance'
  },
  {
    title: 'Giảng viên',
    note: 'Học phần được phân công, roster và lịch dạy.',
    roles: ['lecturer'],
    to: '/app/lecturer'
  },
  {
    title: 'Quản trị hệ thống',
    note: 'Tài khoản, RBAC và audit log toàn hệ thống.',
    roles: ['admin'],
    to: '/app/admin'
  }
];

const PORTAL_GUIDES = [
  {
    title: 'Đăng ký học phần',
    note: 'Theo dõi đợt đăng ký, lọc học phần mở và kiểm tra kết quả đăng ký ngay trong workspace.'
  },
  {
    title: 'Tra cứu học phí',
    note: 'Tổng hợp khoản phải nộp, đã nộp, biên lai điện tử và lịch sử giao dịch thanh toán.'
  },
  {
    title: 'Bảo mật tài khoản',
    note: 'Đổi mật khẩu định kỳ và kiểm tra đúng vai trò được cấp để tránh nhầm nghiệp vụ.'
  }
];

export default function OverviewPage() {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [securityMessage, setSecurityMessage] = useState('');
  const [securityError, setSecurityError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await dashboardApi.getOverview(token);
        if (active) {
          setData(response);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || 'Không thể tải tổng quan hệ thống.');
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
    return <LoadingState label="Đang tải tổng quan hệ thống..." />;
  }

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setSecurityMessage('');
    setSecurityError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSecurityError('Mật khẩu mới và xác nhận mật khẩu chưa khớp.');
      return;
    }

    try {
      const response = await authApi.changePassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setSecurityMessage(response.message);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setSecurityError(error.message || 'Không thể cập nhật mật khẩu.');
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--portal">
        <div className="hero-banner__content">
          <span className="hero-chip">Trang chủ hệ thống</span>
          <h1>Cổng thông tin đào tạo tín chỉ và học phí theo phong cách portal PTIT.</h1>
          <p>
            Theo dõi mốc hạn quan trọng, xem nhanh thông báo học vụ và di chuyển vào đúng workspace
            theo vai trò của bạn.
          </p>
          <div className="badge-row">
            <span className="hero-badge">Đăng ký học phần</span>
            <span className="hero-badge">Lịch học và lịch thi</span>
            <span className="hero-badge">Học phí minh bạch</span>
          </div>
        </div>

        <aside className="hero-banner__aside">
          <h3>Thông tin kỳ học gần nhất</h3>
          {data.deadlines[0] ? (
            <div className="hero-detail-list">
              <div className="hero-detail-row">
                <span>Đợt đăng ký</span>
                <strong>{data.deadlines[0].name || data.deadlines[0].title}</strong>
              </div>
              <div className="hero-detail-row">
                <span>Hạn đăng ký</span>
                <strong>{formatDate(data.deadlines[0].registrationDeadline)}</strong>
              </div>
              <div className="hero-detail-row">
                <span>Hạn học phí</span>
                <strong>{formatDate(data.deadlines[0].paymentDeadline)}</strong>
              </div>
            </div>
          ) : (
            <p className="hero-banner__empty">Chưa có đợt học vụ nào được công bố.</p>
          )}
          <span className="panel-badge panel-badge--accent">Cập nhật từ dashboard service</span>
        </aside>
      </section>

      <section className="panel panel--portal">
        <header className="panel__header">
          <div>
            <h3>Hướng dẫn nhanh</h3>
            <p>Ba luồng thao tác chính mà người dùng thường cần khi vào cổng học vụ.</p>
          </div>
        </header>
        <div className="action-grid action-grid--triple">
          {PORTAL_GUIDES.map((item) => (
            <article key={item.title} className="action-card action-card--portal">
              <h4>{item.title}</h4>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="stats-grid">
        {data.summary.map((item) => (
          <StatCard
            key={item.id}
            eyebrow="Tổng hợp"
            title={item.label}
            value={item.id === 'revenue' || item.id === 'outstanding' ? formatCurrency(item.value) : item.value}
          />
        ))}
      </div>

      <div className="content-grid content-grid--two">
        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>Thông báo và mốc hạn quan trọng</h3>
              <p>Các thông tin vận hành cần theo dõi trong học kỳ hiện tại.</p>
            </div>
          </header>
          <div className="timeline-list">
            {data.deadlines.map((item) => (
              <article key={item.id || item._id} className="timeline-item">
                <div className="timeline-item__dot" />
                <div>
                  <strong>
                    {item.name || item.title} {item.academicYear || ''}
                  </strong>
                  <p>Hạn đăng ký: {formatDate(item.registrationDeadline)}</p>
                  <p>Hạn học phí: {formatDate(item.paymentDeadline)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>Truy cập nhanh</h3>
              <p>Di chuyển vào các phân hệ nghiệp vụ có sẵn cho tài khoản của bạn.</p>
            </div>
          </header>
          <div className="action-grid">
            {MODULES.filter((item) => hasAnyRole(user, item.roles)).map((item) => (
              <Link key={item.title} to={item.to} className="action-card">
                <h4>{item.title}</h4>
                <p>{item.note}</p>
                <span>Mở phân hệ →</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <header className="panel__header">
          <div>
            <h3>Thông tin tài khoản</h3>
            <p>Cập nhật mật khẩu để bảo đảm an toàn cho phiên truy cập hệ thống.</p>
          </div>
        </header>
        <div className="stack-form">
          {user?.mustChangePassword ? <div className="form-error">Tài khoản đang yêu cầu đổi mật khẩu ngay.</div> : null}
          {securityMessage ? <div className="form-success">{securityMessage}</div> : null}
          {securityError ? <div className="form-error">{securityError}</div> : null}
          <form className="stack-form" onSubmit={handleChangePassword}>
            <div className="form-grid">
              <label>
                <span>Mật khẩu hiện tại</span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Mật khẩu mới</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Xác nhận mật khẩu mới</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                  }
                />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Đổi mật khẩu
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

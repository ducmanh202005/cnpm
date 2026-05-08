import { useState } from 'react';
import { authApi } from '../api/portalApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRoles } from '../utils/formatters.js';

export default function AccountSettingsPage() {
  const { token, user } = useAuth();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp.');
      return;
    }

    setSaving(true);
    try {
      const response = await authApi.changePassword(token, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setMessage(response.message || 'Đã cập nhật mật khẩu.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Không thể cập nhật mật khẩu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Tài khoản cá nhân</span>
          <h1>{user?.displayName || 'Người dùng hệ thống'}</h1>
          <p>{formatRoles(user?.roles || [])}</p>
        </div>
      </section>

      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <div className="content-grid content-grid--two">
        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>Thông tin đăng nhập</h3>
              <p>Thông tin tài khoản và vai trò đang được phân quyền.</p>
            </div>
          </header>
          <div className="detail-card">
            <div className="detail-card__row">
              <span>Tên đăng nhập</span>
              <strong>{user?.username || '--'}</strong>
            </div>
            <div className="detail-card__row">
              <span>Vai trò</span>
              <strong>{formatRoles(user?.roles || []) || '--'}</strong>
            </div>
            <div className="detail-card__row">
              <span>Trạng thái</span>
              <strong>Đang hoạt động</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>Đổi mật khẩu</h3>
              <p>Mật khẩu mới cần tối thiểu 8 ký tự và khác mật khẩu hiện tại.</p>
            </div>
          </header>
          <form className="stack-form" onSubmit={handleSubmit}>
            <label>
              <span>Mật khẩu hiện tại</span>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(event) => updateField('currentPassword', event.target.value)}
                required
              />
            </label>
            <label>
              <span>Mật khẩu mới</span>
              <input
                type="password"
                value={form.newPassword}
                minLength={8}
                onChange={(event) => updateField('newPassword', event.target.value)}
                required
              />
            </label>
            <label>
              <span>Xác nhận mật khẩu mới</span>
              <input
                type="password"
                value={form.confirmPassword}
                minLength={8}
                onChange={(event) => updateField('confirmPassword', event.target.value)}
                required
              />
            </label>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

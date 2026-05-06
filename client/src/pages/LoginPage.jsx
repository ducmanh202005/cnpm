import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getPrimaryHome } from '../utils/appConfig.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate(getPrimaryHome(user), { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(form);
    } catch (requestError) {
      setError(requestError.message || 'Không thể đăng nhập.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-grid">
        <section className="login-panel">
          <div className="login-panel__heading">
            <span className="panel-tag">Đăng nhập hệ thống</span>
            <h2>Tài khoản QLĐT PTIT</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              <span>Tên đăng nhập</span>
              <input
                value={form.username}
                onChange={(event) =>
                  setForm((current) => ({ ...current, username: event.target.value }))
                }
                placeholder="Nhập username"
              />
            </label>

            <label>
              <span>Mật khẩu</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Nhập mật khẩu"
              />
            </label>

            {error ? <div className="form-error">{error}</div> : null}

            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>

          </form>
        </section>
      </div>
    </div>
  );
}

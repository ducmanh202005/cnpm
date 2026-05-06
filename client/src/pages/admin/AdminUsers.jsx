import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { adminApi } from '../../api/portalApi.js';
import { formatDateTime, formatRoles } from '../../utils/formatters.js';

const getId = (item) => item?.id || item?._id || '';
const toggleRole = (roles, v) => roles.includes(v) ? roles.filter((r) => r !== v) : [...roles, v];

export default function AdminUsers() {
  const { data, reload, token } = useOutletContext();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', displayName: '', email: '', staffUnit: 'Văn phòng số', password: '', roles: ['academic_office'] });

  const handleCreate = async (e) => {
    e.preventDefault(); setMessage(''); setError('');
    try {
      const r = await adminApi.createUser(token, { ...form, password: form.password || undefined });
      setMessage(r.temporaryPassword ? `Đã tạo tài khoản. Mật khẩu tạm: ${r.temporaryPassword}` : 'Đã tạo tài khoản mới.');
      setForm({ username: '', displayName: '', email: '', staffUnit: 'Văn phòng số', password: '', roles: ['academic_office'] });
      await reload();
    } catch (err) { setError(err.message); }
  };

  const handleToggleLock = async (id) => {
    setMessage(''); setError('');
    try { await adminApi.toggleUserLock(token, id); setMessage('Đã cập nhật trạng thái tài khoản.'); await reload(); }
    catch (err) { setError(err.message); }
  };

  const handleReset = async (id) => {
    setMessage(''); setError('');
    try { const r = await adminApi.resetPassword(token, id); setMessage(`${r.message} Mật khẩu tạm: ${r.temporaryPassword}`); await reload(); }
    catch (err) { setError(err.message); }
  };

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact"><div><span className="hero-chip">Tài khoản</span><h1>Quản lý tài khoản người dùng</h1></div></section>
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <section className="panel">
        <header className="panel__header"><div><h3>Tạo tài khoản mới</h3></div></header>
        <form className="stack-form" onSubmit={handleCreate}>
          <div className="form-grid">
            <label><span>Username</span><input value={form.username} onChange={(e) => setForm((c) => ({ ...c, username: e.target.value }))} /></label>
            <label><span>Họ tên</span><input value={form.displayName} onChange={(e) => setForm((c) => ({ ...c, displayName: e.target.value }))} /></label>
            <label><span>Email</span><input value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} /></label>
            <label><span>Đơn vị</span><input value={form.staffUnit} onChange={(e) => setForm((c) => ({ ...c, staffUnit: e.target.value }))} /></label>
            <label><span>Mật khẩu</span><input type="password" value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} /></label>
          </div>
          <div className="checklist-group">
            {data.rolesCatalog.map((role) => (
              <label key={role.value} className="check-row"><input type="checkbox" checked={form.roles.includes(role.value)} onChange={() => setForm((c) => ({ ...c, roles: toggleRole(c.roles, role.value) }))} /><span>{role.label}</span></label>
            ))}
          </div>
          <button className="primary-button" type="submit">Tạo tài khoản</button>
        </form>
      </section>

      <DataTable title="Tài khoản" rows={data.users} searchable searchKeys={['username', 'displayName', 'email']}
        columns={[
          { label: 'Username', key: 'username' }, { label: 'Họ tên', key: 'displayName' },
          { label: 'Vai trò', key: 'roles', render: (r) => formatRoles(r.roles) },
          { label: 'TT', key: 'accountStatus', type: 'status' },
          { label: 'Login gần nhất', key: 'lastLoginAt', render: (r) => formatDateTime(r.lastLoginAt) },
          { label: '', key: 'actions', sortable: false, render: (r) => (
            <div className="inline-actions">
              <button className="table-button" type="button" onClick={() => handleToggleLock(getId(r))}>Khoá/Mở</button>
              <button className="table-button table-button--ghost" type="button" onClick={() => handleReset(getId(r))}>Reset MK</button>
            </div>
          )}
        ]} />
    </div>
  );
}

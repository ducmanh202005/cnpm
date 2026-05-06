import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { adminApi } from '../../api/portalApi.js';

const getId = (item) => item?.id || item?._id || '';
const toggleRole = (roles, v) => roles.includes(v) ? roles.filter((r) => r !== v) : [...roles, v];

export default function AdminRoles() {
  const { data, reload, token } = useOutletContext();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ userId: getId(data.users[0]), roles: data.users[0]?.roles || [], staffUnit: data.users[0]?.staffUnit || '' });

  const syncForm = (userId) => {
    const u = data.users.find((i) => getId(i) === userId);
    if (u) setForm({ userId, roles: u.roles || [], staffUnit: u.staffUnit || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!form.userId) return; setMessage(''); setError('');
    try { await adminApi.updateRoles(token, form.userId, { roles: form.roles, staffUnit: form.staffUnit }); setMessage('Đã cập nhật vai trò.'); await reload(); }
    catch (err) { setError(err.message); }
  };

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact"><div><span className="hero-chip">Phân quyền</span><h1>Gán vai trò cho tài khoản</h1></div></section>
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <section className="panel">
        <header className="panel__header"><div><h3>Phân quyền tài khoản</h3></div></header>
        <form className="stack-form" onSubmit={handleSubmit}>
          <label><span>Chọn tài khoản</span>
            <select value={form.userId} onChange={(e) => syncForm(e.target.value)}>
              {data.users.map((u) => <option key={getId(u)} value={getId(u)}>{u.username} - {u.displayName}</option>)}
            </select>
          </label>
          <label><span>Đơn vị</span><input value={form.staffUnit} onChange={(e) => setForm((c) => ({ ...c, staffUnit: e.target.value }))} /></label>
          <div className="checklist-group">
            {data.rolesCatalog.map((role) => (
              <label key={role.value} className="check-row"><input type="checkbox" checked={form.roles.includes(role.value)} onChange={() => setForm((c) => ({ ...c, roles: toggleRole(c.roles, role.value) }))} /><span>{role.label}</span></label>
            ))}
          </div>
          <button className="primary-button" type="submit">Lưu phân quyền</button>
        </form>
      </section>

      <div className="content-grid content-grid--two">
        <DataTable title="Phân bổ vai trò" rows={data.roleDistribution || []} columns={[{ label: 'Vai trò', key: 'label' }, { label: 'Code', key: 'role' }, { label: 'Số TK', key: 'count' }]} />
        <DataTable title="Catalog quyền" rows={data.permissionsCatalog || []} columns={[{ label: 'Vai trò', key: 'role' }, { label: 'Quyền', key: 'permissions', render: (r) => r.permissions.join(', ') }]} />
      </div>
    </div>
  );
}

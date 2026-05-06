import { useEffect, useState } from 'react';
import DataTable from '../components/common/DataTable.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { adminApi, workspaceApi } from '../api/portalApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDateTime, formatRoles } from '../utils/formatters.js';

const getId = (item) => item?.id || item?._id || '';

const buildUserForm = () => ({
  username: '',
  displayName: '',
  email: '',
  staffUnit: 'Văn phòng số',
  password: '',
  roles: ['academic_office']
});

export default function AdminWorkspacePage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userForm, setUserForm] = useState(buildUserForm);
  const [roleForm, setRoleForm] = useState({
    userId: '',
    roles: [],
    staffUnit: ''
  });

  const syncRoleForm = (userId, sourceData) => {
    const targetUser = (sourceData?.users || []).find((item) => getId(item) === userId);
    if (!targetUser) {
      return;
    }

    setRoleForm({
      userId,
      roles: targetUser.roles || [],
      staffUnit: targetUser.staffUnit || ''
    });
  };

  const loadWorkspace = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await workspaceApi.admin(token);
      setData(response);
      const nextUserId = roleForm.userId || getId(response.users?.[0]);
      if (nextUserId) {
        syncRoleForm(nextUserId, response);
      }
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải workspace admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [token]);

  const toggleRole = (roles, value) =>
    roles.includes(value) ? roles.filter((item) => item !== value) : [...roles, value];

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await adminApi.createUser(token, {
        ...userForm,
        password: userForm.password || undefined
      });
      setMessage(
        response.temporaryPassword
          ? `Đã tạo tài khoản. Mật khẩu tạm: ${response.temporaryPassword}`
          : 'Đã tạo tài khoản mới.'
      );
      setUserForm(buildUserForm());
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.message || 'Không thể tạo tài khoản.');
    }
  };

  const handleToggleLock = async (userId) => {
    setMessage('');
    setError('');
    try {
      await adminApi.toggleUserLock(token, userId);
      setMessage('Đã cập nhật trạng thái tài khoản.');
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.message || 'Không thể cập nhật trạng thái tài khoản.');
    }
  };

  const handleResetPassword = async (userId) => {
    setMessage('');
    setError('');
    try {
      const response = await adminApi.resetPassword(token, userId);
      setMessage(`${response.message} Mật khẩu tạm: ${response.temporaryPassword}`);
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.message || 'Không thể đặt lại mật khẩu.');
    }
  };

  const handleUpdateRoles = async (event) => {
    event.preventDefault();
    if (!roleForm.userId) {
      return;
    }

    setMessage('');
    setError('');
    try {
      await adminApi.updateRoles(token, roleForm.userId, {
        roles: roleForm.roles,
        staffUnit: roleForm.staffUnit
      });
      setMessage('Đã cập nhật vai trò tài khoản.');
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.message || 'Không thể cập nhật vai trò.');
    }
  };

  if (loading || !data) {
    if (!loading && error) {
      return (
        <div className="page-stack">
          <div className="form-error">{error}</div>
        </div>
      );
    }
    return <LoadingState label="Đang tải workspace admin..." />;
  }

  const totalUsers = data.users.length;
  const lockedUsers = data.users.filter((item) => item.accountStatus === 'locked').length;
  const adminUsers = data.users.filter((item) => item.roles.includes('admin')).length;

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Quản trị</span>
          <h1>Quản lý tài khoản, phân quyền và audit log</h1>
          <p>Không gian này dùng để tạo tài khoản, gán vai trò và truy vết thao tác toàn hệ thống.</p>
        </div>
      </section>

      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <div className="stats-grid">
        <StatCard eyebrow="Tài khoản" title="Tổng số" value={totalUsers} />
        <StatCard eyebrow="Bảo mật" title="Đang bị khoá" value={lockedUsers} />
        <StatCard eyebrow="RBAC" title="Tài khoản admin" value={adminUsers} />
        <StatCard eyebrow="Audit" title="Bản ghi hiển thị" value={data.auditLogs.length} />
      </div>

      <div className="content-grid content-grid--two">
        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>Tạo tài khoản mới</h3>
              <p>Dùng cho staff, admin hoặc các tài khoản vận hành bổ sung.</p>
            </div>
          </header>
          <form className="stack-form" onSubmit={handleCreateUser}>
            <div className="form-grid">
              <label>
                <span>Username</span>
                <input value={userForm.username} onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))} />
              </label>
              <label>
                <span>Họ tên hiển thị</span>
                <input value={userForm.displayName} onChange={(event) => setUserForm((current) => ({ ...current, displayName: event.target.value }))} />
              </label>
              <label>
                <span>Email</span>
                <input value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} />
              </label>
              <label>
                <span>Đơn vị</span>
                <input value={userForm.staffUnit} onChange={(event) => setUserForm((current) => ({ ...current, staffUnit: event.target.value }))} />
              </label>
              <label>
                <span>Mật khẩu (bỏ trống để sinh tạm thời)</span>
                <input type="password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} />
              </label>
            </div>
            <div className="checklist-group">
              {data.rolesCatalog.map((role) => (
                <label key={role.value} className="check-row">
                  <input
                    type="checkbox"
                    checked={userForm.roles.includes(role.value)}
                    onChange={() =>
                      setUserForm((current) => ({
                        ...current,
                        roles: toggleRole(current.roles, role.value)
                      }))
                    }
                  />
                  <span>{role.label}</span>
                </label>
              ))}
            </div>
            <button className="primary-button" type="submit">
              Tạo tài khoản
            </button>
          </form>
        </section>

        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>Phân quyền tài khoản</h3>
              <p>Gán nhiều vai trò cho một tài khoản theo mô hình RBAC.</p>
            </div>
          </header>
          <form className="stack-form" onSubmit={handleUpdateRoles}>
            <label>
              <span>Chon tai khoan</span>
              <select value={roleForm.userId} onChange={(event) => syncRoleForm(event.target.value, data)}>
                {data.users.map((item) => (
                  <option key={item.id || item._id} value={item.id || item._id}>
                    {item.username} - {item.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Don vi</span>
              <input value={roleForm.staffUnit} onChange={(event) => setRoleForm((current) => ({ ...current, staffUnit: event.target.value }))} />
            </label>
            <div className="checklist-group">
              {data.rolesCatalog.map((role) => (
                <label key={role.value} className="check-row">
                  <input
                    type="checkbox"
                    checked={roleForm.roles.includes(role.value)}
                    onChange={() =>
                      setRoleForm((current) => ({
                        ...current,
                        roles: toggleRole(current.roles, role.value)
                      }))
                    }
                  />
                  <span>{role.label}</span>
                </label>
              ))}
            </div>
            <button className="primary-button" type="submit">
              Lưu phân quyền
            </button>
          </form>
        </section>
      </div>

      <DataTable
        title="Tài khoản"
        rows={data.users}
        searchable
        searchKeys={['username', 'displayName', 'email', 'staffUnit']}
        columns={[
          { label: 'Username', key: 'username' },
          { label: 'Họ tên', key: 'displayName' },
          { label: 'Vai trò', key: 'roles', render: (row) => formatRoles(row.roles), sortValue: (row) => row.roles.join(',') },
          { label: 'Trạng thái', key: 'accountStatus', type: 'status' },
          { label: 'Đăng nhập gần nhất', key: 'lastLoginAt', render: (row) => formatDateTime(row.lastLoginAt), sortValue: (row) => row.lastLoginAt },
          {
            label: 'Tác vụ',
            key: 'actions',
            sortable: false,
            render: (row) => (
              <div className="inline-actions">
                <button className="table-button" type="button" onClick={() => syncRoleForm(row.id || row._id, data)}>
                  Chọn
                </button>
                <button className="table-button" type="button" onClick={() => handleToggleLock(row.id || row._id)}>
                  Khoá / Mở
                </button>
                <button className="table-button table-button--ghost" type="button" onClick={() => handleResetPassword(row.id || row._id)}>
                  Reset MK
                </button>
              </div>
            )
          }
        ]}
      />

      <div className="content-grid content-grid--two">
        <DataTable
          title="Phân bổ vai trò"
          rows={data.roleDistribution || []}
          searchable
          searchKeys={['label', 'role']}
          columns={[
            { label: 'Vai trò', key: 'label' },
            { label: 'Code', key: 'role' },
            { label: 'Số tài khoản', key: 'count' }
          ]}
        />

        <DataTable
          title="Catalog quyền"
          rows={data.permissionsCatalog || []}
          searchable
          searchKeys={['role', 'permissions']}
          columns={[
            { label: 'Vai trò', key: 'role' },
            { label: 'Danh sách quyền', key: 'permissions', render: (row) => row.permissions.join(', ') }
          ]}
        />
      </div>

      <DataTable
        title="Audit log"
        rows={data.auditLogs}
        searchable
        searchKeys={['actor.displayName', 'action', 'subjectType', 'result']}
        columns={[
          { label: 'Actor', key: 'actor.displayName' },
          { label: 'Action', key: 'action' },
          { label: 'Doi tuong', key: 'subjectType' },
          { label: 'Ket qua', key: 'result', type: 'status' },
          { label: 'Thoi gian', key: 'createdAt', render: (row) => formatDateTime(row.createdAt), sortValue: (row) => row.createdAt }
        ]}
      />
    </div>
  );
}

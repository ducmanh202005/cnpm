import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import LoadingState from '../../components/common/LoadingState.jsx';
import { workspaceApi } from '../../api/portalApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLayout() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = async () => {
    setLoading(true);
    try { const r = await workspaceApi.admin(token); setData(r); }
    catch (err) { setError(err.message || 'Không thể tải workspace admin.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, [token]);

  if (loading || !data) {
    if (!loading && error) return <div className="page-stack"><div className="form-error">{error}</div></div>;
    return <LoadingState label="Đang tải workspace admin..." />;
  }
  return <Outlet context={{ data, reload, token }} />;
}

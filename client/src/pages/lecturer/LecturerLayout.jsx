import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import LoadingState from '../../components/common/LoadingState.jsx';
import { workspaceApi } from '../../api/portalApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LecturerLayout() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try { const r = await workspaceApi.lecturer(token); if (active) setData(r); }
      catch (err) { if (active) setError(err.message || 'Không thể tải workspace giảng viên.'); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [token]);

  if (loading || !data) {
    if (!loading && error) return <div className="page-stack"><div className="form-error">{error}</div></div>;
    return <LoadingState label="Đang tải workspace giảng viên..." />;
  }
  return <Outlet context={{ data }} />;
}

import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import LoadingState from '../../components/common/LoadingState.jsx';
import { catalogApi, workspaceApi } from '../../api/portalApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function FinanceLayout() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = async () => {
    setLoading(true);
    try {
      const [ws, sem] = await Promise.all([workspaceApi.finance(token), catalogApi.listSemesters(token)]);
      setData(ws); setSemesters(sem.items || []);
    } catch (err) { setError(err.message || 'Không thể tải workspace tài chính.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, [token]);

  if (loading || !data) {
    if (!loading && error) return <div className="page-stack"><div className="form-error">{error}</div></div>;
    return <LoadingState label="Đang tải workspace tài chính..." />;
  }
  return <Outlet context={{ data, semesters, reload, token }} />;
}

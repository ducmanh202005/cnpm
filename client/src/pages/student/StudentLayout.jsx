import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import LoadingState from '../../components/common/LoadingState.jsx';
import { workspaceApi } from '../../api/portalApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function StudentLayout() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = async () => {
    const shouldShowLoading = !data;
    if (shouldShowLoading) {
      setLoading(true);
    }

    setError('');

    try {
      const response = await workspaceApi.student(token);
      setData(response);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu sinh viên.');
    } finally {
      if (shouldShowLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    reload();
  }, [token]);

  if (!data) {
    if (!loading && error) {
      return (
        <div className="page-stack">
          <div className="form-error">{error}</div>
        </div>
      );
    }

    return <LoadingState label="Đang tải cổng sinh viên..." />;
  }

  return <Outlet context={{ data, reload }} />;
}

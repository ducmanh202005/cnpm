import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <Topbar user={user} onLogout={logout} />
      <div className="app-shell__body">
        <Sidebar />
        <main className="app-shell__main">
          <div className="app-shell__content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

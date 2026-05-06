import { NavLink, useLocation } from 'react-router-dom';
import { WORKSPACE_NAV, getWorkspaceKey } from '../../utils/appConfig.js';

export default function Sidebar() {
  const { pathname } = useLocation();
  const wsKey = getWorkspaceKey(pathname);
  const items = WORKSPACE_NAV[wsKey] || WORKSPACE_NAV.overview;

  return (
    <aside className="sidebar" aria-label="Điều hướng">
      <nav className="sidebar__nav">
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.to === `/app/${wsKey}` || item.to === '/app/overview'}
            className={({ isActive }) =>
              isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
            }
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            <span className="sidebar__link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const handleLogout = () => { logout(); nav('/login'); };

  const initials = (user?.name || user?.email || 'U')
    .split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">TF</div>
          <div>
            <div className="brand-name">TeamFlow</div>
            <div className="brand-sub">Task Manager</div>
          </div>
        </div>
        <nav className="nav">
          <NavLink to="/dashboard" className="nav-link">
            <span className="nav-ico">▦</span> Dashboard
          </NavLink>
          <NavLink to="/projects" className="nav-link">
            <span className="nav-ico">▤</span> Projects
          </NavLink>
          <NavLink to="/my-tasks" className="nav-link">
            <span className="nav-ico">✓</span> My Tasks
          </NavLink>
        </nav>
        <div className="sidebar-foot">
          <div className="user-card">
            <div className="avatar">{initials}</div>
            <div className="user-meta">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{user?.role || 'Member'}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-block" onClick={handleLogout}>Log out</button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

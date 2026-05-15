import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Badge from '../components/Badge.jsx';

const STATUSES = ['todo', 'in_progress', 'done'];
const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
const STATUS_TONE  = { todo: 'neutral', in_progress: 'info', done: 'success' };

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true); setError('');
      try {
        const [t, p] = await Promise.all([
          api.get('/tasks').catch(() => []),
          api.get('/projects').catch(() => []),
        ]);
        if (!on) return;
        setTasks(Array.isArray(t) ? t : (t.tasks || []));
        setProjects(Array.isArray(p) ? p : (p.projects || []));
      } catch (e) { setError(e.message); }
      finally { if (on) setLoading(false); }
    })();
    return () => { on = false; };
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, '_');
    const byStatus = { todo: 0, in_progress: 0, done: 0 };
    let overdue = 0;
    const perUser = new Map();
    tasks.forEach((t) => {
      const s = norm(t.status); if (byStatus[s] != null) byStatus[s]++;
      if (t.dueDate && s !== 'done' && new Date(t.dueDate).getTime() < now) overdue++;
      const u = t.assignee?.name || t.assigneeName || t.assignedTo?.name || 'Unassigned';
      perUser.set(u, (perUser.get(u) || 0) + 1);
    });
    return {
      total: tasks.length, byStatus, overdue,
      perUser: [...perUser.entries()].sort((a,b) => b[1]-a[1]).slice(0, 6),
    };
  }, [tasks]);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
          <p className="muted">Here's what's happening across your projects.</p>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="stat-grid">
        <StatCard label="Total Tasks" value={stats.total} accent="indigo" />
        <StatCard label="In Progress" value={stats.byStatus.in_progress} accent="amber" />
        <StatCard label="Completed"   value={stats.byStatus.done}        accent="emerald" />
        <StatCard label="Overdue"     value={stats.overdue}              accent="rose" />
      </section>

      <section className="grid-2">
        <div className="card">
          <div className="card-head">
            <h2>Tasks by status</h2>
          </div>
          <div className="bars">
            {STATUSES.map((s) => {
              const v = stats.byStatus[s];
              const pct = stats.total ? Math.round((v / stats.total) * 100) : 0;
              return (
                <div key={s} className="bar-row">
                  <div className="bar-label"><Badge tone={STATUS_TONE[s]}>{STATUS_LABEL[s]}</Badge> <span className="muted">{v} tasks</span></div>
                  <div className="bar-track"><div className={`bar-fill bar-${s}`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h2>Tasks per user</h2></div>
          {stats.perUser.length === 0 ? (
            <p className="muted">No tasks yet.</p>
          ) : (
            <ul className="user-list">
              {stats.perUser.map(([name, count]) => (
                <li key={name}>
                  <div className="avatar sm">{name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}</div>
                  <span className="grow">{name}</span>
                  <span className="pill">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Recent projects</h2>
          <Link to="/projects" className="btn btn-ghost btn-sm">View all</Link>
        </div>
        {loading ? <p className="muted">Loading…</p> : projects.length === 0 ? (
          <p className="muted">No projects yet. Create one to get started.</p>
        ) : (
          <div className="proj-grid">
            {projects.slice(0, 6).map((p) => (
              <Link key={p._id || p.id} to={`/projects/${p._id || p.id}`} className="proj-card">
                <div className="proj-dot" />
                <div>
                  <div className="proj-name">{p.name}</div>
                  <div className="muted small">{p.description || 'No description'}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`stat stat-${accent}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

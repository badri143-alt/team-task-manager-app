import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import Badge from '../components/Badge.jsx';

const PRIORITY_TONE = { low: 'neutral', medium: 'info', high: 'warn', urgent: 'danger' };

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = await api.get('/tasks/me').catch(() => api.get('/tasks?assignee=me'));
      setTasks(Array.isArray(data) ? data : (data.tasks || []));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const update = async (task, status) => {
    const tid = task._id || task.id;
    setTasks((prev) => prev.map((t) => (t._id || t.id) === tid ? { ...t, status } : t));
    try { await api.patch(`/tasks/${tid}`, { status }); }
    catch (e) { setError(e.message); load(); }
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return t.dueDate && t.status !== 'done' && new Date(t.dueDate).getTime() < Date.now();
    return (t.status || '').toLowerCase().replace(/\s+/g, '_') === filter;
  });

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>My Tasks</h1>
          <p className="muted">Tasks assigned to you across all projects.</p>
        </div>
      </header>

      <div className="filter-bar">
        {['all', 'todo', 'in_progress', 'done', 'overdue'].map((f) => (
          <button key={f} className={`chip ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? <p className="muted">Loading…</p> : filtered.length === 0 ? (
        <p className="muted">No tasks here.</p>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr><th>Task</th><th>Priority</th><th>Due</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const due = t.dueDate ? new Date(t.dueDate) : null;
                const overdue = due && t.status !== 'done' && due.getTime() < Date.now();
                return (
                  <tr key={t._id || t.id}>
                    <td>
                      <div className="bold">{t.title}</div>
                      {t.description && <div className="muted small">{t.description}</div>}
                    </td>
                    <td><Badge tone={PRIORITY_TONE[t.priority] || 'neutral'}>{t.priority || 'medium'}</Badge></td>
                    <td>{due ? due.toLocaleDateString() : '—'} {overdue && <Badge tone="danger">Overdue</Badge>}</td>
                    <td>
                      <select className="status-select" value={t.status || 'todo'} onChange={(e)=>update(t, e.target.value)}>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

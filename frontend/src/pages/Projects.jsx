import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Projects() {

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: ''
  });

  const [saving, setSaving] = useState(false);

  // ======================================
  // LOAD PROJECTS
  // ======================================

  const load = async () => {

    setLoading(true);
    setError('');

    try {

      const data = await api.get('/projects');

      setProjects(
        Array.isArray(data)
          ? data
          : (data.projects || [])
      );

    } catch (e) {

      setError(e.message);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    load();
  }, []);

  // ======================================
  // CREATE PROJECT
  // ======================================

  const create = async (e) => {

    e.preventDefault();

    if (!form.name || !form.name.trim()) {
      return;
    }

    setSaving(true);

    try {

      await api.post('/projects', {

        // backend expects title
        title: form.name.trim(),

        description:
          form.description?.trim() || ''

      });

      setOpen(false);

      setForm({
        name: '',
        description: ''
      });

      await load();

    } catch (e) {

      setError(e.message);

    } finally {

      setSaving(false);

    }
  };

  return (

    <div className="page">

      <header className="page-head">

        <div>
          <h1>Projects</h1>

          <p className="muted">
            All projects you own or belong to.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setOpen(true)}
        >
          + New project
        </button>

      </header>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (

        <p className="muted">Loading…</p>

      ) : projects.length === 0 ? (

        <EmptyState
          title="No projects yet"
          description="Create your first project to start assigning tasks to your team."
          action={
            <button
              className="btn btn-primary"
              onClick={() => setOpen(true)}
            >
              Create project
            </button>
          }
        />

      ) : (

        <div className="proj-grid wide">

          {projects.map((p) => (

            <Link
              key={p._id || p.id}
              to={`/projects/${p._id || p.id}`}
              className="proj-card lg"
            >

              <div className="proj-dot" />

              <div className="grow">

                <div className="proj-name">
                  {p.title || p.name}
                </div>

                <div className="muted small">
                  {p.description || 'No description'}
                </div>

                <div className="proj-meta">

                  <span className="pill">
                    {(p.members?.length || 0)} members
                  </span>

                  <span className="pill">
                    {(p.tasksCount ?? p.tasks?.length ?? 0)} tasks
                  </span>

                </div>

              </div>

            </Link>

          ))}

        </div>

      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create project"

        footer={
          <>
            <button
              className="btn btn-ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={create}
              disabled={saving || !form.name.trim()}
            >
              {saving ? 'Creating…' : 'Create'}
            </button>
          </>
        }
      >

        <form
          onSubmit={create}
          className="form"
        >

          <label className="field">

            <span>Name</span>

            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
              placeholder="Marketing site redesign"
            />

          </label>

          <label className="field">

            <span>Description</span>

            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value
                })
              }
              placeholder="What is this project about?"
            />

          </label>

        </form>

      </Modal>

    </div>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import Badge from '../components/Badge.jsx';

const STATUSES = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const PRIORITY_TONE = {
  low: 'neutral',
  medium: 'info',
  high: 'warn',
  urgent: 'danger',
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('board');

  const [taskOpen, setTaskOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);

  const [memberEmail, setMemberEmail] = useState('');

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: '',
  });

  // =========================================
  // ADMIN CHECK FIX
  // =========================================

  const isAdmin = useMemo(() => {
    if (!user) return false;

    return (
      user.role === 'Admin' ||
      user.role === 'admin'
    );
  }, [user]);

  // =========================================
  // LOAD DATA
  // =========================================

  const load = async () => {
    try {
      setLoading(true);
      setError('');

      const projectData = await api.get(`/projects/${id}`);

      const taskData = await api.get('/tasks');

      setProject(projectData.project || projectData);

      const allTasks = Array.isArray(taskData)
        ? taskData
        : taskData.tasks || [];

      const filtered = allTasks.filter((task) => {
        const pid =
          task.project?._id ||
          task.project?.id ||
          task.project;

        return pid === id;
      });

      setTasks(filtered);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  // =========================================
  // GROUP TASKS
  // =========================================

  const grouped = useMemo(() => {
    const g = {
      todo: [],
      in_progress: [],
      done: [],
    };

    tasks.forEach((task) => {
      const key = (task.status || 'todo')
        .toLowerCase()
        .replace(/\s+/g, '_');

      (g[key] || g.todo).push(task);
    });

    return g;
  }, [tasks]);

  // =========================================
  // CREATE TASK
  // =========================================

  const createTask = async (e) => {
    e.preventDefault();

    try {
      await api.post('/tasks', {
        title: taskForm.title,
        description: taskForm.description,
        dueDate: taskForm.dueDate,
        priority: taskForm.priority,
        assignedTo: taskForm.assignedTo,
        projectId: id,
      });

      setTaskOpen(false);

      setTaskForm({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        assignedTo: '',
      });

      await load();

    } catch (err) {
      setError(err.message);
    }
  };

  // =========================================
  // UPDATE TASK STATUS
  // =========================================

  const updateStatus = async (task, status) => {
    try {
      const tid = task._id || task.id;

      await api.put(`/tasks/${tid}`, {
        status,
      });

      await load();

    } catch (err) {
      setError(err.message);
    }
  };

  // =========================================
  // ADD MEMBER
  // =========================================

  const addMember = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/projects/${id}/members`, {
        email: memberEmail,
      });

      setMemberEmail('');
      setMemberOpen(false);

      await load();

    } catch (err) {
      setError(err.message);
    }
  };

  // =========================================
  // REMOVE MEMBER
  // =========================================

  const removeMember = async (memberId) => {
    try {
      await api.delete(`/projects/${id}/members/${memberId}`);

      await load();

    } catch (err) {
      setError(err.message);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page">
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div className="page">

      <header className="page-head">

        <div>
          <Link to="/projects">
            ← Projects
          </Link>

          <h1>
            {project.title || project.name}
          </h1>

          <p className="muted">
            {project.description}
          </p>
        </div>

        <div className="head-actions">

          {isAdmin && (
            <button
              className="btn btn-ghost"
              onClick={() => setMemberOpen(true)}
            >
              + Add Member
            </button>
          )}

          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => setTaskOpen(true)}
            >
              + New Task
            </button>
          )}

        </div>

      </header>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="tabs">

        <button
          className={`tab ${tab === 'board' ? 'active' : ''}`}
          onClick={() => setTab('board')}
        >
          Board
        </button>

        <button
          className={`tab ${tab === 'members' ? 'active' : ''}`}
          onClick={() => setTab('members')}
        >
          Members ({project.members?.length || 0})
        </button>

      </div>

      {tab === 'board' ? (

        <div className="board">

          {STATUSES.map((col) => (

            <div key={col.key} className="board-col">

              <div className="board-col-head">
                <h3>{col.label}</h3>

                <span className="pill">
                  {grouped[col.key].length}
                </span>
              </div>

              <div className="board-col-body">

                {grouped[col.key].map((task) => (

                  <TaskCard
                    key={task._id}
                    task={task}
                    canEdit={
                      isAdmin ||
                      isAssignee(task, user)
                    }
                    onStatusChange={(status) =>
                      updateStatus(task, status)
                    }
                  />

                ))}

              </div>

            </div>

          ))}

        </div>

      ) : (

        <div className="card">

          <ul className="member-list">

            {(project.members || []).map((m) => {

              const mid =
                m._id ||
                m.id ||
                m.userId;

              return (

                <li key={mid}>

                  <div className="grow">

                    <div className="bold">
                      {m.name}
                    </div>

                    <div className="muted small">
                      {m.email}
                    </div>

                  </div>

                  <Badge tone="info">
                    {m.role || 'Member'}
                  </Badge>

                  {isAdmin &&
                    m.role !== 'Admin' && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeMember(mid)}
                      >
                        Remove
                      </button>
                    )}

                </li>

              );
            })}

          </ul>

        </div>

      )}

      {/* CREATE TASK */}

      <Modal
        open={taskOpen}
        onClose={() => setTaskOpen(false)}
        title="Create Task"
      >

        <form onSubmit={createTask} className="form">

          <input
            placeholder="Task title"
            value={taskForm.title}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                title: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Description"
            value={taskForm.description}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                description: e.target.value,
              })
            }
          />

          <input
            type="date"
            value={taskForm.dueDate}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                dueDate: e.target.value,
              })
            }
          />

          <select
            value={taskForm.priority}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                priority: e.target.value,
              })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={taskForm.assignedTo}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                assignedTo: e.target.value,
              })
            }
          >

            <option value="">
              Select Member
            </option>

            {(project.members || []).map((m) => (

              <option
                key={m._id}
                value={m._id}
              >
                {m.name || m.email}
              </option>

            ))}

          </select>

          <button
            className="btn btn-primary"
            type="submit"
          >
            Create Task
          </button>

        </form>

      </Modal>

      {/* ADD MEMBER */}

      <Modal
        open={memberOpen}
        onClose={() => setMemberOpen(false)}
        title="Add Member"
      >

        <form onSubmit={addMember} className="form">

          <input
            type="email"
            placeholder="Enter email"
            value={memberEmail}
            onChange={(e) =>
              setMemberEmail(e.target.value)
            }
          />

          <button
            className="btn btn-primary"
            type="submit"
          >
            Add Member
          </button>

        </form>

      </Modal>

    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  canEdit,
}) {

  const assignee =
    task.assignedTo?.name;

  return (
    <div className="task-card">

      <div className="task-title">
        {task.title}
      </div>

      <div className="task-desc">
        {task.description}
      </div>

      <div className="task-foot">

        <div>
          👤 {assignee || 'Unassigned'}
        </div>

        {canEdit && (
          <select
            value={task.status || 'todo'}
            onChange={(e) =>
              onStatusChange(e.target.value)
            }
          >
            <option value="todo">
              To Do
            </option>

            <option value="in_progress">
              In Progress
            </option>

            <option value="done">
              Done
            </option>

          </select>
        )}

      </div>

    </div>
  );
}

function isAssignee(task, user) {

  if (!user) return false;

  const uid = user._id || user.id;

  return (
    task.assignedTo?._id === uid
  );
}
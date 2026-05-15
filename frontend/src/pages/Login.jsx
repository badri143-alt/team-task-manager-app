import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.email || !form.password) return setError('Please fill all fields.');
    try {
      await login(form.email.trim(), form.password);
      const to = loc.state?.from?.pathname || '/dashboard';
      nav(to, { replace: true });
    } catch (err) { setError(err.message || 'Login failed'); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark lg">TF</div>
          <h1>Welcome back</h1>
          <p>Sign in to your TeamFlow workspace</p>
        </div>
        <form onSubmit={submit} className="form">
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={update('email')} placeholder="you@company.com" autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={form.password} onChange={update('password')} placeholder="••••••••" autoComplete="current-password" />
          </label>
          <div style={{ marginTop: "10px" }}>
            <Link to="/forgot-password">
              Forgot Password?
            </Link>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-foot">No account? <Link to="/signup">Create one</Link></p>
      </div>
      <div className="auth-aside">
        <div className="aside-inner">
          <h2>Run your team like a pro.</h2>
          <p>Plan projects, assign work, and track progress in one calm, focused place.</p>
          <ul className="aside-list">
            <li>✓ Role-based access for Admins & Members</li>
            <li>✓ Real-time task status & priorities</li>
            <li>✓ Beautiful dashboard insights</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

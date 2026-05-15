import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { signup, loading } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.name || !form.email || !form.password) return setError('All fields are required.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    try {
      await signup(form.name.trim(), form.email.trim(), form.password);
      nav('/dashboard', { replace: true });
    } catch (err) { setError(err.message || 'Signup failed'); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark lg">TF</div>
          <h1>Create account</h1>
          <p>Start managing your team's work today</p>
        </div>
        <form onSubmit={submit} className="form">
          <label className="field">
            <span>Full name</span>
            <input value={form.name} onChange={update('name')} placeholder="Jane Doe" />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={update('email')} placeholder="you@company.com" />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={form.password} onChange={update('password')} placeholder="At least 6 characters" />
          </label>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="auth-foot">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
      <div className="auth-aside">
        <div className="aside-inner">
          <h2>One workspace. Endless flow.</h2>
          <p>Built for teams who ship — not for tools that get in the way.</p>
        </div>
      </div>
    </div>
  );
}

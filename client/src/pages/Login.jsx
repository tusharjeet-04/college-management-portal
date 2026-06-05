import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../lib/error.js';

const DEMO = [
  { role: 'Admin', email: 'admin@college.edu', password: 'Admin@123' },
  { role: 'Faculty', email: 'alan.turing@college.edu', password: 'Faculty@123' },
  { role: 'Student', email: 'asha.verma@college.edu', password: 'Student@123' },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700 p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-slate-900 p-8 text-white md:flex">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-brand-500" />
            <span className="text-xl font-semibold">College Portal</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Manage your campus, simply.</h2>
            <p className="mt-2 text-sm text-slate-300">
              Courses, enrollments, grades, attendance and announcements — all in one
              place for admins, faculty and students.
            </p>
          </div>
          <div className="space-y-2 rounded-lg bg-slate-800/60 p-4 text-xs">
            <p className="font-semibold text-slate-200">Demo accounts</p>
            {DEMO.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => setForm({ email: d.email, password: d.password })}
                className="block w-full rounded px-2 py-1 text-left text-slate-300 hover:bg-slate-700"
              >
                <span className="font-medium text-white">{d.role}:</span> {d.email}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Access your portal account</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

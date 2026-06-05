import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LABELS, ROLE_BADGE } from '../lib/constants.js';
import PageHeader from '../components/PageHeader.jsx';

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-800">{value || '—'}</dd>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="My Profile" subtitle="Your account details" />
      <div className="card max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <span className={`badge ${ROLE_BADGE[user.role]}`}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>
        <dl className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" value={user.email} />
          <Field label="Department" value={user.department} />
          {user.role === 'student' && (
            <Field label="Roll Number" value={user.rollNumber} />
          )}
          {user.role === 'faculty' && (
            <Field label="Designation" value={user.designation} />
          )}
          <Field label="Phone" value={user.phone} />
          <Field
            label="Member since"
            value={new Date(user.createdAt).toLocaleDateString()}
          />
        </dl>
      </div>
    </div>
  );
}

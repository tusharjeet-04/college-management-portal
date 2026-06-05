import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, BookOpen } from 'lucide-react';
import api from '../lib/api.js';
import { getErrorMessage } from '../lib/error.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../lib/constants.js';
import PageHeader from '../components/PageHeader.jsx';
import Spinner from '../components/Spinner.jsx';
import Modal from '../components/Modal.jsx';

const EMPTY = {
  code: '',
  title: '',
  description: '',
  department: '',
  credits: 3,
  semester: '',
  faculty: '',
};

export default function Courses() {
  const { user } = useAuth();
  const isAdmin = user.role === ROLES.ADMIN;
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = isAdmin ? {} : { mine: true };
      const { data } = await api.get('/courses', { params });
      setCourses(data.courses);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    if (isAdmin) {
      api
        .get('/users', { params: { role: 'faculty' } })
        .then(({ data }) => setFaculty(data.users))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/courses', {
        ...form,
        credits: Number(form.credits),
        faculty: form.faculty || undefined,
      });
      toast.success('Course created');
      setOpen(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={isAdmin ? 'Courses' : 'My Courses'}
        subtitle={isAdmin ? 'Manage the course catalog' : 'Courses you teach'}
        action={
          isAdmin && (
            <button className="btn-primary" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> New course
            </button>
          )
        }
      />

      {loading ? (
        <Spinner />
      ) : courses.length === 0 ? (
        <div className="card text-center text-sm text-slate-500">No courses found.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link key={c._id} to={`/courses/${c._id}`} className="card transition hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <span className="badge bg-brand-100 text-brand-700">{c.code}</span>
                <span className="text-xs text-slate-400">{c.credits} cr</span>
              </div>
              <div className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <h3 className="font-semibold text-slate-900">{c.title}</h3>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                {c.description || 'No description'}
              </p>
              <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                {c.department || 'General'} · {c.semester || 'TBA'}
                <div className="mt-1 text-slate-400">
                  {c.faculty ? c.faculty.name : 'No faculty assigned'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title="New course"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" form="course-form" disabled={saving}>
              Create
            </button>
          </>
        }
      >
        <form id="course-form" onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Code</label>
              <input
                className="input"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Credits</label>
              <input
                type="number"
                min={0}
                max={12}
                className="input"
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[80px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Department</label>
              <input
                className="input"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Semester</label>
              <input
                className="input"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Assign faculty</label>
            <select
              className="input"
              value={form.faculty}
              onChange={(e) => setForm({ ...form, faculty: e.target.value })}
            >
              <option value="">— Unassigned —</option>
              {faculty.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.department || 'N/A'})
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

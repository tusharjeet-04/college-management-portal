import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import api from '../lib/api.js';
import { getErrorMessage } from '../lib/error.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../lib/constants.js';
import PageHeader from '../components/PageHeader.jsx';
import Spinner from '../components/Spinner.jsx';
import Modal from '../components/Modal.jsx';

export default function Announcements() {
  const { user } = useAuth();
  const canPost = user.role === ROLES.ADMIN || user.role === ROLES.FACULTY;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', audience: 'all' });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const { data } = await api.get('/announcements');
      setItems(data.announcements);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/announcements', form);
      toast.success('Announcement posted');
      setOpen(false);
      setForm({ title: '', body: '', audience: 'all' });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setItems((prev) => prev.filter((a) => a._id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Stay up to date with campus news"
        action={
          canPost && (
            <button className="btn-primary" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> New
            </button>
          )
        }
      />

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="card text-center text-sm text-slate-500">
          No announcements yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a._id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{a.title}</h3>
                    <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                      {a.body}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span>By {a.author?.name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{new Date(a.createdAt).toLocaleString()}</span>
                      {a.course && (
                        <>
                          <span>•</span>
                          <span className="badge bg-brand-100 text-brand-700">
                            {a.course.code}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {(user.role === ROLES.ADMIN || a.author?._id === user._id) && (
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title="New announcement"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" form="announce-form" disabled={saving}>
              Post
            </button>
          </>
        }
      >
        <form id="announce-form" onSubmit={handleCreate} className="space-y-4">
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
            <label className="label">Message</label>
            <textarea
              className="input min-h-[120px]"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Audience</label>
            <select
              className="input"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
            >
              <option value="all">Everyone</option>
              <option value="students">Students</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

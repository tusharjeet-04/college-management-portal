import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, UserPlus, Trash2, Save } from 'lucide-react';
import api from '../lib/api.js';
import { getErrorMessage } from '../lib/error.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../lib/constants.js';
import PageHeader from '../components/PageHeader.jsx';
import Spinner from '../components/Spinner.jsx';
import Modal from '../components/Modal.jsx';

const GRADES = ['', 'A', 'B', 'C', 'D', 'E', 'F'];

function StudentsTab({ course, enrollments, reload }) {
  const { user } = useAuth();
  const isAdmin = user.role === ROLES.ADMIN;
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState('');
  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    if (isAdmin && open) {
      api
        .get('/users', { params: { role: 'student' } })
        .then(({ data }) => setStudents(data.users))
        .catch((err) => toast.error(getErrorMessage(err)));
    }
  }, [isAdmin, open]);

  async function enroll(e) {
    e.preventDefault();
    try {
      await api.post('/enrollments', { studentId: selected, courseId: course._id });
      toast.success('Student enrolled');
      setOpen(false);
      setSelected('');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function removeEnrollment(id) {
    if (!confirm('Remove this student from the course?')) return;
    try {
      await api.delete(`/enrollments/${id}`);
      toast.success('Removed');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function saveGrade(enr) {
    const draft = drafts[enr._id] || {};
    try {
      await api.patch(`/enrollments/${enr._id}/grade`, {
        grade: draft.grade ?? enr.grade,
        marks:
          draft.marks === undefined
            ? enr.marks
            : draft.marks === ''
              ? null
              : Number(draft.marks),
      });
      toast.success('Grade saved');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const enrolledIds = new Set(enrollments.map((e) => e.student?._id));

  return (
    <div className="card overflow-x-auto p-0">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="font-semibold text-slate-800">
          Enrolled students ({enrollments.length})
        </h3>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <UserPlus className="h-4 w-4" /> Enroll
          </button>
        )}
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Roll No.</th>
            <th className="px-4 py-3">Marks</th>
            <th className="px-4 py-3">Grade</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {enrollments.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                No students enrolled yet.
              </td>
            </tr>
          ) : (
            enrollments.map((enr) => {
              const draft = drafts[enr._id] || {};
              return (
                <tr key={enr._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {enr.student?.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {enr.student?.rollNumber || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="input w-20 py-1"
                      defaultValue={enr.marks ?? ''}
                      onChange={(e) =>
                        setDrafts((d) => ({
                          ...d,
                          [enr._id]: { ...d[enr._id], marks: e.target.value },
                        }))
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="input w-20 py-1"
                      defaultValue={enr.grade || ''}
                      onChange={(e) =>
                        setDrafts((d) => ({
                          ...d,
                          [enr._id]: { ...d[enr._id], grade: e.target.value },
                        }))
                      }
                    >
                      {GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g || '—'}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => saveGrade(enr)}
                        className="rounded-md p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                        disabled={draft.grade === undefined && draft.marks === undefined}
                        aria-label="Save grade"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => removeEnrollment(enr._id)}
                          className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <Modal
        open={open}
        title="Enroll student"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" form="enroll-form" disabled={!selected}>
              Enroll
            </button>
          </>
        }
      >
        <form id="enroll-form" onSubmit={enroll}>
          <label className="label">Select student</label>
          <select
            className="input"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            required
          >
            <option value="">— Choose —</option>
            {students
              .filter((s) => !enrolledIds.has(s._id))
              .map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} {s.rollNumber ? `(${s.rollNumber})` : ''}
                </option>
              ))}
          </select>
        </form>
      </Modal>
    </div>
  );
}

function AttendanceTab({ course, enrollments }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState({});
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);

  async function loadHistory() {
    try {
      const { data } = await api.get(`/courses/${course._id}/attendance`);
      setHistory(data.attendance);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setStatus(studentId, status) {
    setRecords((r) => ({ ...r, [studentId]: status }));
  }

  async function submit() {
    const payload = enrollments.map((e) => ({
      student: e.student._id,
      status: records[e.student._id] || 'present',
    }));
    setSaving(true);
    try {
      await api.post('/attendance', {
        courseId: course._id,
        date,
        records: payload,
      });
      toast.success('Attendance saved');
      loadHistory();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const statusColors = {
    present: 'bg-emerald-600 text-white',
    absent: 'bg-red-600 text-white',
    late: 'bg-amber-500 text-white',
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input w-44"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={submit} disabled={saving || !enrollments.length}>
            <Save className="h-4 w-4" /> Save attendance
          </button>
        </div>
        {enrollments.length === 0 ? (
          <p className="text-sm text-slate-500">Enroll students to mark attendance.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {enrollments.map((e) => {
              const current = records[e.student._id] || 'present';
              return (
                <li
                  key={e._id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {e.student.name}
                  </span>
                  <div className="flex gap-1">
                    {['present', 'absent', 'late'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(e.student._id, s)}
                        className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition ${
                          current === s
                            ? statusColors[s]
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="card">
        <h3 className="mb-3 font-semibold text-slate-800">Recent records</h3>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">No attendance recorded yet.</p>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto text-sm">
            {history.slice(0, 50).map((h) => (
              <div
                key={h._id}
                className="flex items-center justify-between rounded px-2 py-1 hover:bg-slate-50"
              >
                <span className="text-slate-600">
                  {new Date(h.date).toLocaleDateString()} · {h.student?.name}
                </span>
                <span
                  className={`badge capitalize ${
                    h.status === 'present'
                      ? 'bg-emerald-100 text-emerald-700'
                      : h.status === 'absent'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('students');

  async function loadEnrollments() {
    try {
      const { data } = await api.get(`/courses/${id}/enrollments`);
      setEnrollments(data.enrollments);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data.course);
        await loadEnrollments();
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Spinner full />;
  if (!course) return null;

  return (
    <div>
      <Link to="/courses" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to courses
      </Link>
      <PageHeader
        title={`${course.code} — ${course.title}`}
        subtitle={`${course.department || 'General'} · ${course.semester || 'TBA'} · ${
          course.faculty?.name || 'No faculty'
        }`}
      />

      <div className="mb-4 flex gap-2 border-b border-slate-200">
        {[
          { key: 'students', label: 'Students & Grades' },
          { key: 'attendance', label: 'Attendance' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === t.key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'students' ? (
        <StudentsTab course={course} enrollments={enrollments} reload={loadEnrollments} />
      ) : (
        <AttendanceTab course={course} enrollments={enrollments} />
      )}
    </div>
  );
}

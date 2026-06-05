import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  CalendarCheck,
  Megaphone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../lib/constants.js';
import api from '../lib/api.js';
import { getErrorMessage } from '../lib/error.js';
import PageHeader from '../components/PageHeader.jsx';
import Spinner from '../components/Spinner.jsx';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, to, color }) {
  const content = (
    <div className="card flex items-center gap-4 transition hover:shadow-md">
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/stats/admin')
      .then(({ data }) => setStats(data.stats))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={GraduationCap}
        label="Students"
        value={stats.students}
        to="/users"
        color="bg-emerald-100 text-emerald-700"
      />
      <StatCard
        icon={Users}
        label="Faculty"
        value={stats.faculty}
        to="/users"
        color="bg-blue-100 text-blue-700"
      />
      <StatCard
        icon={BookOpen}
        label="Courses"
        value={stats.courses}
        to="/courses"
        color="bg-brand-100 text-brand-700"
      />
      <StatCard
        icon={ClipboardList}
        label="Enrollments"
        value={stats.enrollments}
        color="bg-amber-100 text-amber-700"
      />
    </div>
  );
}

function FacultyDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/courses', { params: { mine: true } })
      .then(({ data }) => setCourses(data.courses))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Assigned courses"
          value={courses.length}
          to="/courses"
          color="bg-brand-100 text-brand-700"
        />
      </div>
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Your courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-slate-500">No courses assigned yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {courses.map((c) => (
              <li key={c._id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-slate-800">
                    {c.code} — {c.title}
                  </div>
                  <div className="text-xs text-slate-500">{c.semester}</div>
                </div>
                <Link to={`/courses/${c._id}`} className="btn-secondary">
                  Manage
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StudentDashboard() {
  const [data, setData] = useState({ enrollments: [], attendance: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/enrollments/me'), api.get('/attendance/me')])
      .then(([enr, att]) =>
        setData({ enrollments: enr.data.enrollments, attendance: att.data.summary }),
      )
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const { enrollments, attendance } = data;
  const attendanceRate =
    attendance && attendance.total
      ? Math.round(((attendance.present + attendance.late) / attendance.total) * 100)
      : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={GraduationCap}
          label="Enrolled courses"
          value={enrollments.length}
          to="/my-courses"
          color="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          icon={CalendarCheck}
          label="Attendance"
          value={attendanceRate === null ? '—' : `${attendanceRate}%`}
          to="/my-attendance"
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon={Megaphone}
          label="Announcements"
          value="View"
          to="/announcements"
          color="bg-amber-100 text-amber-700"
        />
      </div>
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Recent courses</h2>
        {enrollments.length === 0 ? (
          <p className="text-sm text-slate-500">You are not enrolled in any courses.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {enrollments.slice(0, 5).map((e) => (
              <li key={e._id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-slate-800">
                    {e.course?.code} — {e.course?.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {e.course?.faculty?.name || 'Faculty TBA'}
                  </div>
                </div>
                <span className="badge bg-slate-100 text-slate-700">
                  {e.grade || 'In progress'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader
        title={`Welcome, ${user.name.split(' ')[0]}`}
        subtitle="Here's an overview of your portal."
      />
      {user.role === ROLES.ADMIN && <AdminDashboard />}
      {user.role === ROLES.FACULTY && <FacultyDashboard />}
      {user.role === ROLES.STUDENT && <StudentDashboard />}
    </div>
  );
}

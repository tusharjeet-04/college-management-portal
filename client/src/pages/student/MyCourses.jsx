import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';
import api from '../../lib/api.js';
import { getErrorMessage } from '../../lib/error.js';
import PageHeader from '../../components/PageHeader.jsx';
import Spinner from '../../components/Spinner.jsx';

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/enrollments/me')
      .then(({ data }) => setEnrollments(data.enrollments))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="My Courses" subtitle="Your enrolled courses and grades" />
      {enrollments.length === 0 ? (
        <div className="card text-center text-sm text-slate-500">
          You are not enrolled in any courses.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => (
            <div key={e._id} className="card">
              <div className="mb-3 flex items-center justify-between">
                <span className="badge bg-brand-100 text-brand-700">
                  {e.course?.code}
                </span>
                <span className="text-xs text-slate-400">{e.course?.credits} cr</span>
              </div>
              <div className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <h3 className="font-semibold text-slate-900">{e.course?.title}</h3>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {e.course?.faculty?.name || 'Faculty TBA'} · {e.course?.semester}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                  <div className="text-xs text-slate-400">Marks</div>
                  <div className="font-semibold text-slate-800">
                    {e.marks ?? '—'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Grade</div>
                  <div className="text-lg font-bold text-brand-700">
                    {e.grade || '—'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

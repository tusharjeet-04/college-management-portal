import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api.js';
import { getErrorMessage } from '../../lib/error.js';
import PageHeader from '../../components/PageHeader.jsx';
import Spinner from '../../components/Spinner.jsx';

function SummaryCard({ label, value, color }) {
  return (
    <div className="card text-center">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

export default function MyAttendance() {
  const [data, setData] = useState({ attendance: [], summary: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/attendance/me')
      .then(({ data: d }) => setData({ attendance: d.attendance, summary: d.summary }))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const { attendance, summary } = data;
  const rate =
    summary && summary.total
      ? Math.round(((summary.present + summary.late) / summary.total) * 100)
      : 0;

  return (
    <div>
      <PageHeader title="My Attendance" subtitle="Your attendance record across courses" />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <SummaryCard label="Overall" value={`${rate}%`} color="text-brand-700" />
        <SummaryCard
          label="Present"
          value={summary?.present ?? 0}
          color="text-emerald-600"
        />
        <SummaryCard label="Late" value={summary?.late ?? 0} color="text-amber-500" />
        <SummaryCard label="Absent" value={summary?.absent ?? 0} color="text-red-600" />
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attendance.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  No attendance records yet.
                </td>
              </tr>
            ) : (
              attendance.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {a.course?.code} — {a.course?.title}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge capitalize ${
                        a.status === 'present'
                          ? 'bg-emerald-100 text-emerald-700'
                          : a.status === 'absent'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

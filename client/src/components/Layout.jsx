import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Megaphone,
  CalendarCheck,
  GraduationCap,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES, ROLE_LABELS, ROLE_BADGE } from '../lib/constants.js';

const NAV = {
  [ROLES.ADMIN]: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/users', label: 'Users', icon: Users },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/announcements', label: 'Announcements', icon: Megaphone },
  ],
  [ROLES.FACULTY]: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/courses', label: 'My Courses', icon: BookOpen },
    { to: '/announcements', label: 'Announcements', icon: Megaphone },
  ],
  [ROLES.STUDENT]: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/my-courses', label: 'My Courses', icon: GraduationCap },
    { to: '/my-attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/announcements', label: 'Announcements', icon: Megaphone },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = NAV[user.role] || [];

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-slate-200 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
          <GraduationCap className="h-7 w-7 text-brand-500" />
          <span className="text-lg font-semibold text-white">College Portal</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
          <button
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex flex-1 items-center justify-end gap-3">
            <NavLink
              to="/profile"
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <User className="h-5 w-5" />
              </div>
              <div className="hidden text-right sm:block">
                <div className="text-sm font-medium text-slate-800">{user.name}</div>
                <span className={`badge ${ROLE_BADGE[user.role]}`}>
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
            </NavLink>
            <button onClick={handleLogout} className="btn-secondary">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

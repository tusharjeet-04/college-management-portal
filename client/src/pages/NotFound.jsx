import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-center">
      <h1 className="text-6xl font-bold text-brand-600">404</h1>
      <p className="text-slate-600">The page you are looking for does not exist.</p>
      <Link to="/" className="btn-primary">
        Back to home
      </Link>
    </div>
  );
}

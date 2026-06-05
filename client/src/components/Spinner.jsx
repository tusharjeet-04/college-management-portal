import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Loading...', full = false }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 text-slate-500 ${
        full ? 'min-h-[60vh]' : 'py-10'
      }`}
    >
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

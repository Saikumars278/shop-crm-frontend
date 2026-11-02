import Link from "next/link";
import { FiAlertTriangle, FiHome } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 font-sans">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/25 mb-6">
          <FiAlertTriangle size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          404
        </h1>
        <h2 className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-200">
          Page Not Found
        </h2>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          The page or resource you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:brightness-110 transition active:scale-95"
          >
            <FiHome size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}


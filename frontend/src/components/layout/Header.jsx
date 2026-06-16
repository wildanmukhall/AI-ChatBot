import { LuMenu } from 'react-icons/lu';
import useAuthStore from '../../stores/authStore';

export function Header({ onOpenSidebar }) {
  const user = useAuthStore((state) => state.user);
  const initial = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        {/* Left Side: Mobile Menu Trigger & Context Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSidebar}
            className="md:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <LuMenu className="text-2xl" />
          </button>
          {/* Breadcrumb or Page Title can go here, handled dynamically later */}
        </div>

        {/* Right Side: Actions (e.g., Theme Toggle, User Avatar) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="hidden sm:block font-sans text-sm text-slate-600 dark:text-slate-400">
              {user?.name || 'User'}
            </span>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-montserrat font-semibold text-sm shadow-md shadow-indigo-500/20">
              {initial}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

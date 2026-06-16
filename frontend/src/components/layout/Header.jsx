import { LuMenu } from 'react-icons/lu';

export function Header({ onOpenSidebar }) {
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
          {/* Placeholder for User Avatar */}
          <button className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-montserrat font-semibold text-sm">
            U
          </button>
        </div>
      </div>
    </header>
  );
}

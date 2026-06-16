import { LuMenu, LuPlus } from 'react-icons/lu';

/**
 * Header hanya tampil di mobile (md:hidden).
 * Di desktop, header disembunyikan agar tampilan AI Chat penuh.
 *
 * Props:
 *  - onOpenSidebar : buka sidebar mobile
 *  - onNewChat     : buat sesi chat baru
 *  - sessionTitle  : nama / judul sesi chat yang aktif
 */
export function Header({ onOpenSidebar, onNewChat, sessionTitle }) {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between h-14 px-4">

        {/* Kiri: Hamburger menu */}
        <button
          id="mobile-sidebar-toggle"
          onClick={onOpenSidebar}
          aria-label="Buka sidebar"
          className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
        >
          <LuMenu className="text-2xl" />
        </button>

        {/* Tengah: Nama sesi chat */}
        <span className="flex-1 mx-3 text-sm font-sans font-semibold text-slate-700 dark:text-slate-200 truncate text-center">
          {sessionTitle || 'AI ChatBot'}
        </span>

        {/* Kanan: Tambah chat baru */}
        <button
          id="mobile-new-chat"
          onClick={onNewChat}
          aria-label="Chat baru"
          className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
        >
          <LuPlus className="text-2xl" />
        </button>

      </div>
    </header>
  );
}

import { LuMenu, LuPlus } from 'react-icons/lu';
import useAuthStore from '../../stores/authStore';

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
  const user = useAuthStore((state) => state.user);

  return (
    <header className="md:hidden sticky top-0 z-30 bg-[#0A0A09]/80 backdrop-blur-xl border-b border-white/8">
      <div className="flex items-center justify-between h-14 px-4">

        {/* Kiri: Hamburger menu */}
        <button
          id="mobile-sidebar-toggle"
          onClick={onOpenSidebar}
          aria-label="Buka sidebar"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900/80 border border-white/5 text-neutral-400 hover:text-white transition-colors"
        >
          <LuMenu className="text-xl" />
        </button>

        {/* Tengah: Nama sesi chat */}
        <span className="flex-1 mx-3 text-sm font-sans font-medium text-neutral-200 truncate text-center uppercase tracking-wide">
          {sessionTitle || user?.name || 'AI ChatBot'}
        </span>

        {/* Kanan: Tambah chat baru */}
        <button
          id="mobile-new-chat"
          onClick={onNewChat}
          aria-label="Chat baru"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900/80 border border-white/5 text-neutral-400 hover:text-white transition-colors"
        >
          <LuPlus className="text-xl" />
        </button>

      </div>
    </header>
  );
}

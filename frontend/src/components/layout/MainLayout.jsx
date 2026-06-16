import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Placeholder: nantinya bisa diambil dari store/context sesi chat aktif
  const [sessionTitle] = useState('');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleNewChat = () => {
    // TODO: implementasi buat sesi chat baru
    console.log('New chat session');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Fixed Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header: hanya tampil di mobile (md:hidden ditangani di dalam Header) */}
        <Header
          onOpenSidebar={toggleSidebar}
          onNewChat={handleNewChat}
          sessionTitle={sessionTitle}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Outlet is where the child routes will be rendered */}
          <div className="container max-w-5xl mx-auto p-4 md:p-8">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

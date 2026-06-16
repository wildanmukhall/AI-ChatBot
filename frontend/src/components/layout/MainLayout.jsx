import { useState } from 'react';
import { Outlet, useMatch } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isChatRoute = useMatch('/chat/*');

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  const handleNewChat = () => {
    window.location.href = '/chat';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onOpenSidebar={toggleMobileSidebar}
          onNewChat={handleNewChat}
          sessionTitle={isChatRoute ? 'AI Chat' : ''}
        />

        <main className="flex-1 overflow-hidden">
          {isChatRoute ? (
            <div className="h-full flex flex-col bg-white dark:bg-slate-900">
              <Outlet />
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="w-full p-4 md:p-8">
                <Outlet />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

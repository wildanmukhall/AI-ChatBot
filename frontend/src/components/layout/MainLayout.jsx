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
    <div className="flex h-screen overflow-hidden bg-[#0A0A09] relative z-0">
      {/* Dynamic Glassmorphic Floating Blobs */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.07] blur-[100px] pointer-events-none z-0 animate-float-blob-1"
        style={{
          background: "radial-gradient(circle, #facc15 0%, #f97316 60%, transparent 100%)",
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full opacity-[0.05] blur-[100px] pointer-events-none z-0 animate-float-blob-2"
        style={{
          background: "radial-gradient(circle, #fbbf24 0%, #ea580c 60%, transparent 100%)",
        }}
      />

      <Sidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
        <Header
          onOpenSidebar={toggleMobileSidebar}
          onNewChat={handleNewChat}
          sessionTitle={isChatRoute ? 'AI Chat' : ''}
        />

        <main className="flex-1 overflow-hidden relative">
          {isChatRoute ? (
            <div className="h-full flex flex-col bg-transparent">
              <Outlet />
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="w-full p-4 md:p-8 relative z-10">
                <Outlet />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Fixed Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onOpenSidebar={toggleSidebar} />
        
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

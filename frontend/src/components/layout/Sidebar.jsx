import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import {
    LuMessageSquare,
    LuImage,
    LuLayoutDashboard,
    LuUser,
    LuLogOut,
} from "react-icons/lu";

export function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const initial = (user?.name || 'U').charAt(0).toUpperCase();

    const navItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: <LuLayoutDashboard className="text-xl" />,
        },
        {
            name: "AI Chat",
            path: "/chat",
            icon: <LuMessageSquare className="text-xl" />,
        },
        {
            name: "Generate Image",
            path: "/image",
            icon: <LuImage className="text-xl" />,
        },
        {
            name: "Profile",
            path: "/profile",
            icon: <LuUser className="text-xl" />,
        },
    ];

    const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 
    border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out
    md:translate-x-0 md:static md:inset-0
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
  `;

    const overlayClasses = `
    fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity md:hidden
    ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
  `;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={overlayClasses}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidebar Content */}
            <aside className={sidebarClasses}>
                <div className="flex flex-col h-full">
                    {/* Logo / Brand Area */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800">
                        <span className="font-montserrat font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                            AI ChatBot
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => onClose()} // Close on click for mobile
                                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans font-medium transition-colors
                  ${
                      isActive
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                  }
                `}
                            >
                                {item.icon}
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Bottom Area (Quota & Logout) */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                        {/* Simple Quota Card */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-sans font-medium text-slate-700 dark:text-slate-300">
                                    Image Quota
                                </span>
                                <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                    12 left
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                                    style={{ width: "25%" }}
                                ></div>
                            </div>
                        </div>

                        {/* User Avatar + Sign Out Row */}
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                            {/* User Avatar */}
                            <button
                                title="Profile"
                                onClick={() => { navigate('/profile'); onClose(); }}
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white font-montserrat font-semibold text-sm flex-shrink-0 shadow hover:opacity-90 transition-opacity"
                            >
                                {initial}
                            </button>

                            {/* Username / display name */}
                            <span className="flex-1 text-sm font-sans font-medium text-slate-700 dark:text-slate-300 truncate">
                                {user?.name || 'User'}
                            </span>

                            {/* Sign Out — icon only */}
                            <button
                                title="Sign Out"
                                onClick={async () => {
                                    await logout();
                                    navigate('/login', { replace: true });
                                }}
                                className="flex items-center justify-center w-8 h-8 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                                <LuLogOut className="text-xl" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

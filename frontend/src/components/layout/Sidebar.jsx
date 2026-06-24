import { useState } from "react";
import { NavLink, useNavigate, useMatch, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../stores/authStore";
import { chatApi } from "../../api/chatApi";
import {
    LuMessageSquare,
    LuImage,
    LuLayoutDashboard,
    LuUser,
    LuLogOut,
    LuPlus,
    LuTrash2,
    LuLoader,
    LuGalleryHorizontalEnd,
} from "react-icons/lu";

export function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const initial = (user?.name || "U").charAt(0).toUpperCase();

    const [hovered, setHovered] = useState(false);

    const isChatRoute = useMatch("/chat/*");
    const { sessionId } = useParams();

    /*
     * showText = true  → sidebar expanded (tampilkan teks + detail)
     * showText = false → sidebar collapsed (icon saja)
     *
     * Kondisi show:
     *   - Desktop : saat di-hover
     *   - Mobile  : saat sidebar slide-in (isOpen)
     *
     * Dengan React state murni (bukan md: prefix), transisi
     * CSS transition-all bekerja sebagaimana mestinya.
     */
    const showText = hovered || isOpen;

    const { data: sessionsData, isLoading: loadingSessions } = useQuery({
        queryKey: ["chat-sessions"],
        queryFn: async () => {
            const res = await chatApi.getSessions({ per_page: 50 });
            return res.data.data;
        },
        enabled: !!isChatRoute,
    });

    const createSession = useMutation({
        mutationFn: async () => {
            const res = await chatApi.createSession({
                title: "Percakapan Baru",
            });
            return res.data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
            navigate(`/chat/${data.id}`);
            onClose();
        },
    });

    const deleteSession = useMutation({
        mutationFn: (id) => chatApi.deleteSession(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
            if (sessionId) navigate("/chat");
        },
    });

    const navItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: <LuLayoutDashboard className="text-[20px] shrink-0" />,
        },
        {
            name: "AI Chat",
            path: "/chat",
            icon: <LuMessageSquare className="text-[20px] shrink-0" />,
        },
        {
            name: "Generate Image",
            path: "/image",
            icon: <LuImage className="text-[20px] shrink-0" />,
        },
        {
            name: "Gallery",
            path: "/gallery",
            icon: <LuGalleryHorizontalEnd className="text-[20px] shrink-0" />,
        },
        {
            name: "Profile",
            path: "/profile",
            icon: <LuUser className="text-[20px] shrink-0" />,
        },
    ];

    /* ─── Aside width ─────────────────────────────────────────────────
     * Mobile : w-72 + translate slide
     * Desktop: w-[72px] default, w-72 saat hover
     * Keduanya pakai transition-all → animasi lebar smooth
     */
    const asideClass = [
        "fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden",
        "bg-white dark:bg-slate-900",
        "border-r border-slate-200 dark:border-slate-800",
        "transition-all duration-300 ease-in-out",
        // Mobile: lebar penuh, slide
        "w-72",
        isOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: reset translate, lebar ikut hover
        "md:translate-x-0 md:static md:inset-0",
        hovered ? "md:w-72" : "md:w-[72px]",
    ].join(" ");

    const overlayClass = [
        "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity md:hidden",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
    ].join(" ");

    /*
     * ─── Helper class ──────────────────────────────────────────────
     *
     * shrinkText: elemen teks yg mengecil ke 0 saat collapsed.
     * Karena ini dikontrol via React state (bukan md: prefix),
     * CSS transition-all duration-300 benar-benar menganimasikan
     * max-width 240px → 0 dan opacity 1 → 0 secara smooth.
     */
    const shrinkText = [
        "overflow-hidden whitespace-nowrap",
        "transition-all duration-300 ease-in-out",
        showText ? "max-w-[240px] opacity-100" : "max-w-0 opacity-0",
    ].join(" ");

    /*
     * rowClass: parent container yang align icon + teks.
     * Gap dan padding di-transisi di sini agar saat teks
     * mengecil ke 0, tidak ada sisa space dari gap.
     */
    const rowClass = (extraExpanded = "", extraCollapsed = "") =>
        [
            "flex items-center transition-all duration-300 ease-in-out",
            showText
                ? `justify-start gap-3 ${extraExpanded}`
                : `justify-center gap-0 ${extraCollapsed}`,
        ].join(" ");

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={overlayClass}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={asideClass}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* ══ LOGO ══════════════════════════════════════════════════ */}
                <div
                    className={`shrink-0 h-16 border-b border-slate-200 dark:border-slate-800 ${rowClass("px-5", "px-0")}`}
                >
                    <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 shadow-md shadow-blue-500/25">
                        <span className="text-white font-montserrat font-extrabold text-xs tracking-tight">
                            AI
                        </span>
                    </div>
                    <span
                        className={`font-montserrat font-bold text-xl bg-clip-text text-transparent bg-linear-to-r from-blue-500 to-purple-500 ${shrinkText}`}
                    >
                        AI ChatBot
                    </span>
                </div>

                {/* ══ NAV LINKS ═════════════════════════════════════════════ */}
                <nav
                    className={`shrink-0 pt-5 pb-3 space-y-1 transition-all duration-300 ${showText ? "px-3" : "px-2"}`}
                >
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === "/chat"}
                            onClick={() => onClose()}
                            title={!showText ? item.name : undefined}
                            className={({ isActive }) =>
                                [
                                    "py-2.5 rounded-xl font-sans font-medium",
                                    "transition-all duration-300 ease-in-out",
                                    // rowClass logic inline agar bisa tambah w-10 mx-auto saat collapsed
                                    showText
                                        ? "flex items-center justify-start gap-3 px-3"
                                        : "flex items-center justify-center gap-0 px-0 w-10 mx-auto",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200",
                                ].join(" ")
                            }
                        >
                            {item.icon}
                            <span className={shrinkText}>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* ══ FLEX-1 — selalu ada, bottom selalu stay di bawah ══════ */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    {isChatRoute && (
                        <div
                            className={[
                                "h-full flex flex-col border-t border-slate-200 dark:border-slate-800",
                                "transition-opacity duration-300 ease-in-out",
                                showText
                                    ? "opacity-100 pointer-events-auto"
                                    : "opacity-0 pointer-events-none",
                            ].join(" ")}
                        >
                            <div className="shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
                                <span className="text-xs font-sans font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Riwayat Chat
                                </span>
                                <button
                                    onClick={() => createSession.mutate()}
                                    disabled={createSession.isPending}
                                    title="Chat Baru"
                                    className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors disabled:opacity-60"
                                >
                                    {createSession.isPending ? (
                                        <LuLoader className="text-xs animate-spin" />
                                    ) : (
                                        <LuPlus className="text-xs" />
                                    )}
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
                                {loadingSessions ? (
                                    <div className="flex items-center justify-center py-6">
                                        <LuLoader className="text-xl text-slate-400 animate-spin" />
                                    </div>
                                ) : sessionsData?.length > 0 ? (
                                    sessionsData.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => {
                                                navigate(`/chat/${s.id}`);
                                                onClose();
                                            }}
                                            className={[
                                                "group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors",
                                                String(s.id) ===
                                                String(sessionId)
                                                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <LuMessageSquare className="text-sm shrink-0 opacity-60" />
                                                <span className="font-sans text-sm truncate">
                                                    {s.title || "Untitled"}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteSession.mutate(s.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                                            >
                                                <LuTrash2 className="text-sm" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <LuMessageSquare className="text-2xl text-slate-300 dark:text-slate-600 mx-auto mb-1" />
                                        <p className="font-sans text-xs text-slate-400">
                                            Belum ada chat
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ══ BOTTOM — selalu di bawah ══════════════════════════════ */}
                <div className="shrink-0 border-t border-slate-200 dark:border-slate-800">
                    {/* Quota card — max-height collapse smooth */}
                    <div
                        className={[
                            "overflow-hidden px-3 transition-all duration-300 ease-in-out",
                            showText
                                ? "max-h-28 opacity-100 pt-3"
                                : "max-h-0 opacity-0 pt-0",
                        ].join(" ")}
                    >
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-sans font-medium text-slate-700 dark:text-slate-300">
                                    Image Quota
                                </span>
                                <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                    {user?.image_quota || 0} left
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* User row */}
                    <div className={`py-3 ${rowClass("px-3", "px-0")}`}>
                        {/* Avatar — selalu tampil */}
                        <button
                            title="Profile"
                            onClick={() => {
                                navigate("/profile");
                                onClose();
                            }}
                            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-purple-500 text-white font-montserrat font-semibold text-sm shadow-md hover:opacity-90 transition-opacity"
                        >
                            {initial}
                        </button>

                        {/* Username — mengecil ke 0 */}
                        <span
                            className={`flex-1 text-sm font-sans font-medium text-slate-700 dark:text-slate-300 ${shrinkText}`}
                        >
                            {user?.name || "User"}
                        </span>

                        {/* Sign Out — mengecil ke 0 */}
                        <div
                            className={[
                                "overflow-hidden shrink-0",
                                "transition-all duration-300 ease-in-out",
                                showText
                                    ? "max-w-9 opacity-100"
                                    : "max-w-0 opacity-0",
                            ].join(" ")}
                        >
                            <button
                                title="Sign Out"
                                onClick={async () => {
                                    await logout();
                                    navigate("/login", { replace: true });
                                }}
                                className="flex items-center justify-center w-9 h-9 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                                <LuLogOut className="text-xl shrink-0" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

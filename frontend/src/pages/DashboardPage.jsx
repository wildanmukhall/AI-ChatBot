import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profileApi";
import useAuthStore from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import {
    LuMessageSquare,
    LuImage,
    LuZap,
    LuTrendingUp,
    LuImages,
    LuShoppingBag,
    LuArrowRight,
    LuSparkles,
} from "react-icons/lu";

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const { data: stats, isLoading } = useQuery({
        queryKey: ["profile-stats"],
        queryFn: async () => {
            const res = await profileApi.getStats();
            return res.data.data;
        },
        refetchInterval: 30000, // auto-refresh setiap 30 detik
    });

    const statCards = [
        {
            label: "Chat Sessions",
            value: stats?.total_chat_sessions ?? 0,
            icon: <LuMessageSquare className="text-xl" />,
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-500/10",
            textColor: "text-blue-400",
            href: "/chat",
        },
        {
            label: "Total Pesan",
            value: stats?.total_messages ?? 0,
            icon: <LuTrendingUp className="text-xl" />,
            color: "from-emerald-500 to-teal-500",
            bgColor: "bg-emerald-500/10",
            textColor: "text-emerald-400",
            href: "/chat",
        },
        {
            label: "Gambar Di-generate",
            value: stats?.total_images ?? 0,
            icon: <LuImage className="text-xl" />,
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-500/10",
            textColor: "text-purple-400",
            href: "/gallery",
        },
        {
            label: "Sisa Kuota Gambar",
            value: stats?.remaining_quota ?? 0,
            icon: <LuZap className="text-xl" />,
            color: "from-amber-500 to-orange-500",
            bgColor: "bg-amber-500/10",
            textColor: "text-amber-400",
            href: "/profile",
        },
    ];

    const quotaPercent = (() => {
        const remaining = stats?.remaining_quota ?? 0;
        const used = stats?.total_used_quota ?? 0;
        const total = remaining + used;
        if (total === 0) return 0;
        return Math.round((remaining / total) * 100);
    })();

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-slate-900 dark:text-slate-50">
                        Selamat datang, {user?.name?.split(" ")[0] ?? "User"} 👋
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-sans mt-1">
                        Berikut ringkasan aktivitas akun kamu.
                    </p>
                </div>

                {/* Quick buy quota shortcut */}
                {(stats?.remaining_quota ?? 0) < 5 && (
                    <button
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-sans text-sm font-semibold shadow-lg shadow-amber-500/25 hover:opacity-90 transition-opacity shrink-0"
                    >
                        <LuZap className="text-sm" />
                        Tambah Kuota
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <button
                        key={card.label}
                        onClick={() => navigate(card.href)}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-xl ${card.bgColor}`}
                            >
                                <span className={card.textColor}>{card.icon}</span>
                            </div>
                            <LuArrowRight className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors text-sm" />
                        </div>
                        <p
                            className={`text-2xl font-montserrat font-bold text-slate-900 dark:text-slate-50 ${isLoading ? "animate-pulse" : ""}`}
                        >
                            {isLoading ? "..." : card.value.toLocaleString("id-ID")}
                        </p>
                        <p className="text-sm font-sans text-slate-500 dark:text-slate-400 mt-1">
                            {card.label}
                        </p>
                    </button>
                ))}
            </div>

            {/* Quota Progress + Buy CTA */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                        <h2 className="font-montserrat font-bold text-slate-900 dark:text-slate-50">
                            Kuota Generate Gambar
                        </h2>
                        <p className="font-sans text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {isLoading
                                ? "Memuat..."
                                : `${stats?.remaining_quota ?? 0} kuota tersisa dari ${(stats?.remaining_quota ?? 0) + (stats?.total_used_quota ?? 0)} total`}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-sans text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-purple-500/20 shrink-0"
                    >
                        <LuShoppingBag className="text-sm" />
                        Beli Kuota
                    </button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                            quotaPercent > 50
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                : quotaPercent > 20
                                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                : "bg-gradient-to-r from-rose-500 to-red-500"
                        }`}
                        style={{ width: `${quotaPercent}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1.5">
                    <span className="font-sans text-xs text-slate-400">
                        Terpakai: {stats?.total_used_quota ?? 0}
                    </span>
                    <span className="font-sans text-xs text-slate-400">
                        {quotaPercent}% tersisa
                    </span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="text-lg font-montserrat font-bold text-slate-900 dark:text-slate-50 mb-4">
                    Mulai Sekarang
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <a
                        href="/chat"
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-colors group"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25">
                            <LuMessageSquare className="text-xl" />
                        </div>
                        <div>
                            <p className="font-sans font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                AI Chat
                            </p>
                            <p className="font-sans text-sm text-slate-500 dark:text-slate-400">
                                Percakapan dengan Gemini AI
                            </p>
                        </div>
                    </a>

                    <a
                        href="/image"
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-colors group"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25">
                            <LuSparkles className="text-xl" />
                        </div>
                        <div>
                            <p className="font-sans font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                Generate Gambar
                            </p>
                            <p className="font-sans text-sm text-slate-500 dark:text-slate-400">
                                Buat gambar dari teks
                            </p>
                        </div>
                    </a>

                    <a
                        href="/gallery"
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors group"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
                            <LuImages className="text-xl" />
                        </div>
                        <div>
                            <p className="font-sans font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                Galeri Gambar
                            </p>
                            <p className="font-sans text-sm text-slate-500 dark:text-slate-400">
                                Lihat riwayat generate
                            </p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}

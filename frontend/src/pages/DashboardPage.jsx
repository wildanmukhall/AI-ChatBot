import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profileApi";
import useAuthStore from "../stores/authStore";
import { LuMessageSquare, LuImage, LuZap, LuTrendingUp } from "react-icons/lu";

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user);

    // Fetch profile stats dari API (PRD Section 9.2)
    const { data: statsData, isLoading } = useQuery({
        queryKey: ["profile-stats"],
        queryFn: async () => {
            const res = await profileApi.getStats();
            return res.data.data;
        },
    });

    const statCards = [
        {
            label: "Total Chat Sessions",
            value: statsData?.total_chat_sessions ?? "—",
            icon: <LuMessageSquare className="text-xl" />,
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-500/10",
            textColor: "text-blue-400",
        },
        {
            label: "Total Pesan",
            value: statsData?.total_messages ?? "—",
            icon: <LuTrendingUp className="text-xl" />,
            color: "from-emerald-500 to-teal-500",
            bgColor: "bg-emerald-500/10",
            textColor: "text-emerald-400",
        },
        {
            label: "Gambar Dibuat",
            value: statsData?.total_images ?? "0",
            icon: <LuImage className="text-xl" />,
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-500/10",
            textColor: "text-purple-400",
        },
        {
            label: "Sisa Kuota Gambar",
            value: statsData?.remaining_quota ?? "0",
            icon: <LuZap className="text-xl" />,
            color: "from-amber-500 to-orange-500",
            bgColor: "bg-amber-500/10",
            textColor: "text-amber-400",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-slate-900 dark:text-slate-50">
                    Selamat datang, {user?.name?.split(" ")[0] ?? "User"} 👋
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-sans mt-1">
                    Berikut ringkasan aktivitas akun kamu.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-xl ${card.bgColor}`}
                            >
                                <span className={card.textColor}>
                                    {card.icon}
                                </span>
                            </div>
                        </div>
                        <p
                            className={`text-2xl font-montserrat font-bold text-slate-900 dark:text-slate-50 ${isLoading ? "animate-pulse" : ""}`}
                        >
                            {isLoading ? "..." : card.value}
                        </p>
                        <p className="text-sm font-sans text-slate-500 dark:text-slate-400 mt-1">
                            {card.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="text-lg font-montserrat font-bold text-slate-900 dark:text-slate-50 mb-4">
                    Mulai Sekarang
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <a
                        href="/chat"
                        className="flex items-center gap-4 p-4 rounded-xl bg-linear-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-colors group"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25">
                            <LuMessageSquare className="text-xl" />
                        </div>
                        <div>
                            <p className="font-sans font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                AI Chat
                            </p>
                            <p className="font-sans text-sm text-slate-500 dark:text-slate-400">
                                Mulai percakapan dengan Gemini AI
                            </p>
                        </div>
                    </a>
                    <a
                        href="/image"
                        className="flex items-center gap-4 p-4 rounded-xl bg-linear-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-colors group"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25">
                            <LuImage className="text-xl" />
                        </div>
                        <div>
                            <p className="font-sans font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                Generate Gambar
                            </p>
                            <p className="font-sans text-sm text-slate-500 dark:text-slate-400">
                                Buat gambar dari prompt teks
                            </p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}

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
import { GlassCard, Button } from "@glinui/ui";

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
            href: "/chat",
        },
        {
            label: "Total Pesan",
            value: stats?.total_messages ?? 0,
            icon: <LuTrendingUp className="text-xl" />,
            href: "/chat",
        },
        {
            label: "Gambar Di-generate",
            value: stats?.total_images ?? 0,
            icon: <LuImage className="text-xl" />,
            href: "/gallery",
        },
        {
            label: "Sisa Kuota Gambar",
            value: stats?.remaining_quota ?? 0,
            icon: <LuZap className="text-xl" />,
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
                    <h1 className="text-2xl md:text-3xl font-sans font-bold text-white">
                        Selamat datang, {user?.name?.split(" ")[0] ?? "User"} 👋
                    </h1>
                    <p className="text-neutral-400 font-sans mt-1">
                        Berikut ringkasan aktivitas akun kamu.
                    </p>
                </div>

                {/* Quick buy quota shortcut */}
                {(stats?.remaining_quota ?? 0) < 5 && (
                    <Button
                        onClick={() => navigate("/profile")}
                        className="h-10 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-sans font-semibold rounded-full border-none shadow-lg shadow-amber-500/10 flex items-center gap-2"
                    >
                        <LuZap className="text-sm" />
                        Tambah Kuota
                    </Button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <GlassCard
                        key={card.label}
                        onClick={() => navigate(card.href)}
                        className="p-5 cursor-pointer text-left hover:-translate-y-1 transition-all group relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500">
                                {card.icon}
                            </div>
                            <LuArrowRight className="text-neutral-500 group-hover:text-amber-500 transition-colors text-sm" />
                        </div>
                        <p
                            className={`text-2xl font-sans font-bold text-white ${isLoading ? "animate-pulse" : ""}`}
                        >
                            {isLoading ? "..." : card.value.toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs font-sans text-neutral-500 uppercase tracking-wider mt-1">
                            {card.label}
                        </p>
                    </GlassCard>
                ))}
            </div>

            {/* Quota Progress + Buy CTA */}
            <GlassCard className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                        <h2 className="font-sans font-semibold text-lg text-white">
                            Kuota Generate Gambar
                        </h2>
                        <p className="font-sans text-sm text-neutral-400 mt-0.5">
                            {isLoading
                                ? "Memuat..."
                                : `${stats?.remaining_quota ?? 0} kuota tersisa dari ${(stats?.remaining_quota ?? 0) + (stats?.total_used_quota ?? 0)} total`}
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate("/profile")}
                        className="h-10 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-sans font-semibold rounded-full border-none shadow-md shadow-amber-500/10 flex items-center gap-2"
                    >
                        <LuShoppingBag className="text-sm" />
                        Beli Kuota
                    </Button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                    <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${quotaPercent}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2">
                    <span className="font-sans text-xs text-neutral-500">
                        Terpakai: {stats?.total_used_quota ?? 0}
                    </span>
                    <span className="font-sans text-xs text-neutral-500">
                        {quotaPercent}% tersisa
                    </span>
                </div>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard className="p-6">
                <h2 className="text-lg font-sans font-semibold text-white mb-4">
                    Mulai Sekarang
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <a
                        href="/chat"
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-all group"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-500 border border-amber-500/10">
                            <LuMessageSquare className="text-xl" />
                        </div>
                        <div>
                            <p className="font-sans font-semibold text-neutral-200 group-hover:text-amber-500 transition-colors">
                                AI Chat
                            </p>
                            <p className="font-sans text-xs text-neutral-500 mt-0.5">
                                Percakapan dengan Gemini AI
                            </p>
                        </div>
                    </a>

                    <a
                        href="/image"
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-all group"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-500 border border-amber-500/10">
                            <LuSparkles className="text-xl" />
                        </div>
                        <div>
                            <p className="font-sans font-semibold text-neutral-200 group-hover:text-amber-500 transition-colors">
                                Generate Gambar
                            </p>
                            <p className="font-sans text-xs text-neutral-500 mt-0.5">
                                Buat gambar dari teks
                            </p>
                        </div>
                    </a>

                    <a
                        href="/gallery"
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-all group"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-500 border border-amber-500/10">
                            <LuImages className="text-xl" />
                        </div>
                        <div>
                            <p className="font-sans font-semibold text-neutral-200 group-hover:text-amber-500 transition-colors">
                                Galeri Gambar
                            </p>
                            <p className="font-sans text-xs text-neutral-500 mt-0.5">
                                Lihat riwayat generate
                            </p>
                        </div>
                    </a>
                </div>
            </GlassCard>
        </div>
    );
}

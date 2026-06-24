import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import { getPricingPlans, checkout, getOrders } from '../api/paymentApi';
import useAuthStore from '../stores/authStore';
import useQuotaStore from '../stores/quotaStore';
import {
    LuUser, LuLock, LuLoader, LuCheck, LuSave,
    LuZap, LuShoppingBag, LuHistory,
    LuCircleCheck, LuClock, LuCircleX, LuBadgeCheck,
    LuCreditCard, LuSparkles, LuImage,
} from 'react-icons/lu';
import { GlassCard, Input, Button } from '@glinui/ui';
import { gooeyToast } from 'goey-toast';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

const ORDER_STATUS = {
    paid: {
        label: 'Berhasil', icon: LuCircleCheck,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    pending: {
        label: 'Menunggu', icon: LuClock,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20',
    },
    failed: {
        label: 'Gagal', icon: LuCircleX,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/20',
    },
    expired: {
        label: 'Expired', icon: LuClock,
        color: 'text-neutral-500',
        bg: 'bg-neutral-800 border-neutral-700',
    },
    cancelled: {
        label: 'Dibatalkan', icon: LuCircleX,
        color: 'text-neutral-500',
        bg: 'bg-neutral-800 border-neutral-700',
    },
};

// ── Pricing Plan Card ─────────────────────────────────────────────────────────

const PLAN_HIGHLIGHTS = {
    Starter: { color: 'from-amber-500/10 to-orange-500/10 border-white/5', glow: 'shadow-amber-500/5', badge: null, isSolid: false },
    Basic:   { color: 'from-amber-500/20 to-orange-500/20 border-white/5', glow: 'shadow-amber-500/5', badge: null, isSolid: false },
    Pro:     { color: 'from-[#161615]/80 to-amber-500/25 border-amber-500/40', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]', badge: '🔥 Populer', isSolid: false },
    Ultra:   { color: 'from-[#161615]/80 to-orange-500/30 border-orange-500/45', glow: 'shadow-[0_0_25px_rgba(249,115,22,0.2)]', badge: '⚡ Terbaik', isSolid: false },
};

function PricingCard({ plan, onSelect, isLoading: buyLoading, buyingId }) {
    const hi = PLAN_HIGHLIGHTS[plan.name] ?? PLAN_HIGHLIGHTS.Basic;
    const isBuying = buyingId === plan.id;

    return (
        <GlassCard className={`relative flex flex-col overflow-hidden hover:shadow-xl ${hi.glow} transition-all duration-300 group border ${hi.badge ? 'border-amber-500/30' : 'border-white/5'}`}>
            {hi.badge && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">
                    {hi.badge}
                </div>
            )}

            {/* Gradient header */}
            <div className={`bg-gradient-to-br ${hi.color} p-5 ${hi.isSolid ? 'text-black font-semibold' : 'text-white'}`}>
                <p className="font-sans font-bold text-lg">{plan.name}</p>
                <p className="font-sans font-extrabold text-3xl mt-1">
                    {formatRupiah(plan.price)}
                </p>
                <p className={`font-sans text-xs opacity-75 mt-0.5`}>sekali bayar</p>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#161615]/45 border border-white/5">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${PLAN_HIGHLIGHTS.Pro.color} text-black shadow-md`}>
                        <LuImage className="text-base" />
                    </div>
                    <div>
                        <p className="font-sans font-bold text-xl text-white">
                            {plan.image_quota}
                        </p>
                        <p className="font-sans text-xs text-neutral-500">
                            kuota generate gambar
                        </p>
                    </div>
                </div>

                <ul className="space-y-2">
                    {[
                        'Generate gambar AI berkualitas tinggi',
                        'Simpan ke galeri pribadi',
                        'Download tanpa watermark',
                    ].map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs font-sans text-neutral-400">
                            <LuCheck className="text-emerald-500 shrink-0 mt-0.5" />
                            {f}
                        </li>
                    ))}
                </ul>

                <Button
                    onClick={() => onSelect(plan)}
                    disabled={buyLoading}
                    className={`mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl font-sans font-semibold text-sm text-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all border-none shadow-md disabled:opacity-60 cursor-pointer`}
                >
                    {isBuying ? (
                        <LuLoader className="animate-spin text-sm" />
                    ) : (
                        <LuShoppingBag className="text-sm" />
                    )}
                    {isBuying ? 'Memproses...' : 'Beli Sekarang'}
                </Button>
            </div>
        </GlassCard>
    );
}

// ── Order Row ─────────────────────────────────────────────────────────────────

function OrderRow({ order }) {
    const cfg = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
    const Icon = cfg.icon;
    return (
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border ${cfg.bg}`}>
            <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-9 h-9 rounded-full border ${cfg.bg}`}>
                    <Icon className={`text-base ${cfg.color}`} />
                </div>
                <div>
                    <p className="font-mono text-xs text-neutral-500">
                        {order.order_code}
                    </p>
                    <p className="font-sans font-semibold text-sm text-white">
                        {formatRupiah(order.amount)}
                        {order.image_quota && (
                            <span className="ml-2 font-normal text-neutral-400">
                                · {order.image_quota} kuota gambar
                            </span>
                        )}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3 sm:text-right">
                <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                    </span>
                    <p className="font-sans text-xs text-neutral-500 mt-1">
                        {formatDate(order.created_at)}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Snap Payment Modal ────────────────────────────────────────────────────────

function SnapModal({ snapToken, clientKey, onClose, onSuccess }) {
    useEffect(() => {
        if (!snapToken || !clientKey) return;

        // Load Midtrans Snap Script
        const snapSrcUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
        const scriptId = 'midtrans-snap-script';

        let script = document.getElementById(scriptId);
        if (!script) {
            script = document.createElement('script');
            script.src = snapSrcUrl;
            script.id = scriptId;
            script.setAttribute('data-client-key', clientKey);
            script.async = true;
            document.body.appendChild(script);
        }

        const triggerSnap = () => {
            if (window.snap) {
                window.snap.pay(snapToken, {
                    onSuccess: function (result) {
                        onSuccess(result);
                    },
                    onPending: function (result) {
                        onClose();
                    },
                    onError: function (result) {
                        onClose();
                    },
                    onClose: function () {
                        onClose();
                    },
                });
            }
        };

        if (window.snap) {
            triggerSnap();
        } else {
            script.onload = triggerSnap;
        }

        return () => {
            // Keep script loaded to avoid multiple appends, but ensure snap overlay is closed
        };
    }, [snapToken, clientKey]); // Exclude onClose/onSuccess from dependencies to avoid re-triggering

    // Snap handles its own modal UI — don't render any overlay
    return null;
}

// ── Main ProfilePage ──────────────────────────────────────────────────────────

export default function ProfilePage() {
    const { user, fetchUser } = useAuthStore();
    const refreshQuota = useQuotaStore((s) => s.refreshQuota);
    const queryClient = useQueryClient();

    const [nameForm, setNameForm] = useState({ name: user?.name || '' });
    const [passForm, setPassForm] = useState({
        current_password: '', password: '', password_confirmation: '',
    });

    // Payment state
    const [snapData, setSnapData] = useState(null); // { snapToken, clientKey }
    const [buyingId, setBuyingId] = useState(null);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'credit' | 'history'

    // ── Queries ───────────────────────────────────────────────────────────────

    const { data: profileData } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await profileApi.getProfile();
            return res.data.data;
        },
    });

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['profile-stats'],
        queryFn: async () => {
            const res = await profileApi.getStats();
            return res.data.data;
        },
        refetchInterval: 15000,
    });

    const { data: plansData, isLoading: plansLoading } = useQuery({
        queryKey: ['pricing-plans'],
        queryFn: async () => {
            const res = await getPricingPlans();
            return res.data.data;
        },
    });

    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await getOrders();
            return res.data.data ?? [];
        },
    });

    // ── Mutations ─────────────────────────────────────────────────────────────

    const updateProfile = useMutation({
        mutationFn: (data) => profileApi.updateProfile(data),
        onSuccess: () => {
            gooeyToast.success('Nama berhasil diperbarui.');
            fetchUser();
        },
        onError: (err) => {
            gooeyToast.error(err.response?.data?.message || 'Gagal update nama.');
        },
    });

    const updatePassword = useMutation({
        mutationFn: (data) => profileApi.updatePassword(data),
        onSuccess: () => {
            gooeyToast.success('Password berhasil diperbarui.');
            setPassForm({ current_password: '', password: '', password_confirmation: '' });
        },
        onError: (err) => {
            gooeyToast.error(err.response?.data?.message || 'Gagal update password.');
        },
    });

    // ── Buy / Checkout ────────────────────────────────────────────────────────

    const handleBuyPlan = useCallback(async (plan) => {
        setBuyingId(plan.id);
        try {
            const res = await checkout({ pricing_plan_id: plan.id });
            const { data } = res.data;
            const snapToken = data.payment.snap_token;
            // Get client key from meta or env (exposed via API or hardcoded for sandbox)
            const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '';
            setSnapData({ snapToken, clientKey, orderId: data.order.id });
        } catch (err) {
            gooeyToast.error(err.response?.data?.message || 'Gagal memulai pembayaran. Coba lagi.');
        } finally {
            setBuyingId(null);
        }
    }, []);

    const handlePaymentSuccess = useCallback(async () => {
        if (snapData?.orderId) {
            // Force backend to sync with Midtrans (useful for local Sandbox without Ngrok)
            try {
                await import('../api/paymentApi').then(m => m.getOrderDetail(snapData.orderId));
            } catch (e) {
                console.error("Gagal sync order status", e);
            }
        }
        
        gooeyToast.success('Pembayaran berhasil! Kuota kamu telah ditambahkan.');
        queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['image-quota'] });
        refreshQuota();
        fetchUser();
        setSnapData(null); // Explicitly close modal
        setActiveTab('history'); // Balik ke halaman riwayat
    }, [queryClient, refreshQuota, fetchUser, snapData]);

    // ── Quota display helpers ─────────────────────────────────────────────────

    const remaining = stats?.remaining_quota ?? 0;
    const used      = stats?.total_used_quota ?? 0;
    const total     = remaining + used;
    const pct       = total > 0 ? Math.round((remaining / total) * 100) : 0;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 w-full">

            {/* Page header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-sans font-bold text-white">
                    Profil & Akun
                </h1>
                <p className="text-neutral-400 font-sans mt-1">
                    Kelola informasi, kuota, dan riwayat pembayaran kamu.
                </p>
            </div>

            {/* ── Tab header + Credit Widget ─────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Tabs */}
                <div className="flex-1 min-w-0">
                    {/* Tab Nav */}
                    <div className="flex gap-1 bg-[#161615]/45 border border-white/5 p-1 rounded-xl mb-6">
                        {[
                            { id: 'profile', label: 'Profil', icon: LuUser },
                            { id: 'credit',  label: 'Beli Kuota', icon: LuShoppingBag },
                            { id: 'history', label: 'Riwayat', icon: LuHistory },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-sans text-sm font-medium transition-all cursor-pointer ${
                                    activeTab === id
                                        ? 'bg-amber-500 text-black font-semibold shadow-sm'
                                        : 'text-neutral-400 hover:text-white'
                                }`}
                            >
                                <Icon className="text-sm" />
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Tab: Profile ── */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Profile card */}
                            <GlassCard className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-black font-sans font-bold text-xl shadow-lg shadow-amber-500/15">
                                        {(profileData?.name || user?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-sans font-bold text-lg text-white">
                                            {profileData?.name || user?.name}
                                        </p>
                                        <p className="font-sans text-sm text-neutral-400">
                                            {profileData?.email || user?.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Update Name */}
                                <div className="border-t border-white/8 pt-5">
                                    <h2 className="font-sans font-bold text-base text-white mb-4">
                                        Ubah Nama
                                    </h2>
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(nameForm); }}
                                        className="flex gap-3"
                                    >
                                        <div className="relative flex-1">
                                            <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg z-10" />
                                            <Input
                                                type="text"
                                                variant="glass"
                                                value={nameForm.name}
                                                onChange={(e) => setNameForm({ name: e.target.value })}
                                                placeholder="Nama Lengkap"
                                                className="h-11 pl-11 pr-4 rounded-2xl focus-visible:ring-amber-500/30 focus-visible:border-amber-500/60 transition-all text-white placeholder-neutral-500 bg-none bg-[#161615]/45 border-white/8 backdrop-blur-md"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={updateProfile.isPending}
                                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-full h-11 px-5 font-sans font-semibold text-sm hover:from-amber-400 hover:to-orange-400 transition-all border-none shadow-md disabled:opacity-60 cursor-pointer"
                                        >
                                            {updateProfile.isPending ? <LuLoader className="animate-spin" /> : <LuSave />}
                                            Simpan
                                        </Button>
                                    </form>
                                </div>
                            </GlassCard>

                            {/* Update Password */}
                            <GlassCard className="p-6">
                                <h2 className="font-sans font-bold text-base text-white mb-4">
                                    Ubah Password
                                </h2>
                                <form
                                    onSubmit={(e) => { e.preventDefault(); updatePassword.mutate(passForm); }}
                                    className="space-y-3"
                                >
                                    {[
                                        { name: 'current_password', placeholder: 'Password saat ini' },
                                        { name: 'password', placeholder: 'Password baru (min 8 karakter)' },
                                        { name: 'password_confirmation', placeholder: 'Konfirmasi password baru' },
                                    ].map((f) => (
                                        <div key={f.name} className="relative">
                                            <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg z-10" />
                                            <Input
                                                type="password"
                                                variant="glass"
                                                value={passForm[f.name]}
                                                onChange={(e) => setPassForm((p) => ({ ...p, [f.name]: e.target.value }))}
                                                placeholder={f.placeholder}
                                                className="h-11 pl-11 pr-4 rounded-2xl focus-visible:ring-amber-500/30 focus-visible:border-amber-500/60 transition-all text-white placeholder-neutral-500 bg-none bg-[#161615]/45 border-white/8 backdrop-blur-md"
                                            />
                                        </div>
                                    ))}
                                    <Button
                                        type="submit"
                                        disabled={updatePassword.isPending}
                                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-full h-11 px-5 font-sans font-semibold text-sm hover:from-amber-400 hover:to-orange-400 transition-all border-none shadow-md disabled:opacity-60 cursor-pointer"
                                    >
                                        {updatePassword.isPending ? <LuLoader className="animate-spin" /> : <LuLock />}
                                        Ubah Password
                                    </Button>
                                </form>
                            </GlassCard>
                        </div>
                    )}

                    {/* ── Tab: Beli Kuota ── */}
                    {activeTab === 'credit' && (
                        <div className="space-y-4">
                            <GlassCard className="relative overflow-hidden p-6 shadow-2xl border border-white/8 bg-[#0A0A09]/60 backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                                {/* Glowing Orbs */}
                                <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl" />
                                <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <LuSparkles className="text-amber-500 text-xl" />
                                        <h2 className="font-sans font-bold text-lg text-white">
                                            Tambah Kuota Generate
                                        </h2>
                                    </div>
                                    <p className="font-sans text-sm text-neutral-400 leading-relaxed">
                                        Pilih paket yang sesuai kebutuhanmu. Kuota langsung aktif setelah pembayaran berhasil.
                                    </p>
                                </div>
                            </GlassCard>

                            {plansLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-64 bg-neutral-900/40 border border-white/5 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(plansData || []).map((plan) => (
                                        <PricingCard
                                            key={plan.id}
                                            plan={plan}
                                            onSelect={handleBuyPlan}
                                            isLoading={!!buyingId}
                                            buyingId={buyingId}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Tab: Riwayat ── */}
                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <h2 className="font-sans font-bold text-base text-white">
                                Riwayat Transaksi
                            </h2>
                            {ordersLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-16 bg-neutral-900/40 border border-white/5 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : !ordersData?.length ? (
                                <GlassCard className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <LuHistory className="text-amber-500 text-3xl" />
                                    </div>
                                    <p className="font-sans text-sm text-neutral-400">
                                        Belum ada riwayat transaksi.
                                    </p>
                                    <Button
                                        onClick={() => setActiveTab('credit')}
                                        className="h-10 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-sans font-semibold rounded-full border-none shadow-md shadow-amber-500/10 flex items-center gap-2 cursor-pointer"
                                    >
                                        <LuShoppingBag className="text-sm" />
                                        Beli Kuota Pertama
                                    </Button>
                                </GlassCard>
                            ) : (
                                <div className="space-y-3">
                                    {ordersData.map((order) => (
                                        <OrderRow key={order.id} order={order} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Credit Widget (sidebar kanan) ─────────────────────────── */}
                <div className="lg:w-72 shrink-0 space-y-4">
                    {/* Quota Card */}
                    <GlassCard className="relative overflow-hidden p-5 shadow-[0_0_20px_rgba(245,158,11,0.05)] border border-white/8 bg-[#0A0A09]/60 backdrop-blur-xl">
                        {/* Glowing Orbs */}
                        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl" />
                        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <LuZap className="text-amber-500 animate-pulse" />
                                    <span className="font-sans font-bold text-sm text-white">Kuota Kamu</span>
                                </div>
                                <span className="text-xs font-sans text-neutral-400 font-medium">
                                    {statsLoading ? '...' : `${pct}% tersisa`}
                                </span>
                            </div>

                            <p className="font-sans font-extrabold text-4xl text-white mb-1">
                                {statsLoading ? '...' : remaining}
                            </p>
                            <p className="font-sans text-sm text-neutral-400 mb-4">
                                kuota generate gambar tersisa
                            </p>

                            {/* Progress */}
                            <div className="w-full bg-neutral-800 rounded-full h-2 mb-3">
                                <div
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs font-sans text-neutral-500">
                                <span>Terpakai: {used}</span>
                                <span>Total: {total}</span>
                            </div>

                            {remaining < 5 && (
                                <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 text-xs font-sans text-rose-400">
                                    ⚠️ Kuota hampir habis! Segera beli paket baru.
                                </div>
                            )}

                            <Button
                                onClick={() => setActiveTab('credit')}
                                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-sans text-sm font-semibold hover:from-amber-400 hover:to-orange-400 transition-all border-none shadow-md cursor-pointer"
                            >
                                <LuShoppingBag className="text-sm" />
                                Tambah Kuota
                            </Button>
                        </div>
                    </GlassCard>

                    {/* Account Stats */}
                    <GlassCard className="p-5 space-y-3">
                        <h3 className="font-sans font-bold text-sm text-white">
                            Statistik Akun
                        </h3>
                        {[
                            { label: 'Chat Sessions', val: stats?.total_chat_sessions ?? 0, icon: '💬' },
                            { label: 'Total Pesan', val: stats?.total_messages ?? 0, icon: '📨' },
                            { label: 'Gambar Di-generate', val: stats?.total_images ?? 0, icon: '🖼️' },
                            { label: 'Transaksi Berhasil', val: stats?.total_paid_orders ?? 0, icon: '✅' },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center justify-between">
                                <span className="font-sans text-sm text-neutral-400 flex items-center gap-2">
                                    <span>{s.icon}</span> {s.label}
                                </span>
                                <span className="font-sans font-bold text-sm text-white">
                                    {statsLoading ? '...' : s.val.toLocaleString('id-ID')}
                                </span>
                            </div>
                        ))}
                    </GlassCard>
                </div>
            </div>

            {/* ── Snap Modal ─────────────────────────────────────────────────── */}
            {snapData && (
                <SnapModal
                    snapToken={snapData.snapToken}
                    clientKey={snapData.clientKey}
                    onClose={() => setSnapData(null)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}

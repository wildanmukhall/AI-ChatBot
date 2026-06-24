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
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    },
    pending: {
        label: 'Menunggu', icon: LuClock,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    },
    failed: {
        label: 'Gagal', icon: LuCircleX,
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    },
    expired: {
        label: 'Expired', icon: LuClock,
        color: 'text-slate-500',
        bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    },
    cancelled: {
        label: 'Dibatalkan', icon: LuCircleX,
        color: 'text-slate-500',
        bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    },
};

// ── Pricing Plan Card ─────────────────────────────────────────────────────────

const PLAN_HIGHLIGHTS = {
    Starter: { color: 'from-sky-500 to-blue-600', glow: 'shadow-blue-500/20', badge: null },
    Basic:   { color: 'from-violet-500 to-purple-600', glow: 'shadow-purple-500/20', badge: null },
    Pro:     { color: 'from-amber-500 to-orange-500', glow: 'shadow-orange-500/20', badge: '🔥 Populer' },
    Ultra:   { color: 'from-pink-500 to-rose-600', glow: 'shadow-rose-500/20', badge: '⚡ Terbaik' },
};

function PricingCard({ plan, onSelect, isLoading: buyLoading, buyingId }) {
    const hi = PLAN_HIGHLIGHTS[plan.name] ?? PLAN_HIGHLIGHTS.Basic;
    const isBuying = buyingId === plan.id;

    return (
        <div className={`relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border-2 ${hi.badge ? 'border-violet-400 dark:border-violet-600' : 'border-slate-200 dark:border-slate-800'} overflow-hidden hover:shadow-xl ${hi.glow} transition-all duration-300 group`}>
            {hi.badge && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-violet-600 to-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                    {hi.badge}
                </div>
            )}

            {/* Gradient header */}
            <div className={`bg-gradient-to-br ${hi.color} p-5 text-white`}>
                <p className="font-montserrat font-bold text-lg">{plan.name}</p>
                <p className="font-montserrat font-extrabold text-3xl mt-1">
                    {formatRupiah(plan.price)}
                </p>
                <p className="font-sans text-sm opacity-80 mt-0.5">sekali bayar</p>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${hi.color} text-white shadow-md`}>
                        <LuImage className="text-base" />
                    </div>
                    <div>
                        <p className="font-montserrat font-bold text-xl text-slate-900 dark:text-slate-50">
                            {plan.image_quota}
                        </p>
                        <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
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
                        <li key={f} className="flex items-start gap-2 text-xs font-sans text-slate-600 dark:text-slate-400">
                            <LuCheck className="text-emerald-500 shrink-0 mt-0.5" />
                            {f}
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => onSelect(plan)}
                    disabled={buyLoading}
                    className={`mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl font-sans font-semibold text-sm text-white bg-gradient-to-r ${hi.color} hover:opacity-90 transition-all shadow-md disabled:opacity-60`}
                >
                    {isBuying ? (
                        <LuLoader className="animate-spin text-sm" />
                    ) : (
                        <LuShoppingBag className="text-sm" />
                    )}
                    {isBuying ? 'Memproses...' : 'Beli Sekarang'}
                </button>
            </div>
        </div>
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
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        {order.order_code}
                    </p>
                    <p className="font-sans font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {formatRupiah(order.amount)}
                        {order.image_quota && (
                            <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
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
                    <p className="font-sans text-xs text-slate-400 mt-1">
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

        const scriptId = 'midtrans-snap-script';
        let script = document.getElementById(scriptId);
        let isOpened = false; // Prevent multiple opens

        const openSnap = () => {
            if (isOpened) return;
            if (window.snap) {
                isOpened = true;
                window.snap.pay(snapToken, {
                    onSuccess: (result) => {
                        onSuccess(result);
                    },
                    onPending: (result) => {
                        console.log('Payment pending:', result);
                        onClose();
                    },
                    onError: (result) => {
                        console.error('Payment error:', result);
                        onClose();
                    },
                    onClose: () => {
                        onClose();
                    },
                });
            } else {
                setTimeout(openSnap, 100);
            }
        };

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', clientKey);
            script.onload = openSnap;
            document.body.appendChild(script);
        } else {
            openSnap();
        }
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
    const [nameSuccess, setNameSuccess] = useState('');
    const [passSuccess, setPassSuccess] = useState('');
    const [nameError, setNameError] = useState('');
    const [passError, setPassError] = useState('');

    // Payment state
    const [snapData, setSnapData] = useState(null); // { snapToken, clientKey }
    const [buyingId, setBuyingId] = useState(null);
    const [paySuccess, setPaySuccess] = useState('');
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
            setNameSuccess('Nama berhasil diperbarui.');
            setNameError('');
            fetchUser();
            setTimeout(() => setNameSuccess(''), 3000);
        },
        onError: (err) => {
            setNameError(err.response?.data?.message || 'Gagal update.');
            setNameSuccess('');
        },
    });

    const updatePassword = useMutation({
        mutationFn: (data) => profileApi.updatePassword(data),
        onSuccess: () => {
            setPassSuccess('Password berhasil diperbarui.');
            setPassError('');
            setPassForm({ current_password: '', password: '', password_confirmation: '' });
            setTimeout(() => setPassSuccess(''), 3000);
        },
        onError: (err) => {
            setPassError(err.response?.data?.message || 'Gagal update password.');
            setPassSuccess('');
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
            alert(err.response?.data?.message || 'Gagal memulai pembayaran. Coba lagi.');
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
        
        setPaySuccess('Pembayaran berhasil! Kuota kamu telah ditambahkan.');
        queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['image-quota'] });
        refreshQuota();
        fetchUser();
        setSnapData(null); // Explicitly close modal
        setActiveTab('history'); // Balik ke halaman riwayat
        setTimeout(() => setPaySuccess(''), 5000);
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
                <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-slate-900 dark:text-slate-50">
                    Profil & Akun
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-sans mt-1">
                    Kelola informasi, kuota, dan riwayat pembayaran kamu.
                </p>
            </div>

            {/* Payment success toast */}
            {paySuccess && (
                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                    <LuBadgeCheck className="text-emerald-500 text-xl shrink-0" />
                    <p className="font-sans text-sm text-emerald-700 dark:text-emerald-300">{paySuccess}</p>
                </div>
            )}

            {/* ── Tab header + Credit Widget ─────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Tabs */}
                <div className="flex-1 min-w-0">
                    {/* Tab Nav */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
                        {[
                            { id: 'profile', label: 'Profil', icon: LuUser },
                            { id: 'credit',  label: 'Beli Kuota', icon: LuShoppingBag },
                            { id: 'history', label: 'Riwayat', icon: LuHistory },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-sans text-sm font-medium transition-all ${
                                    activeTab === id
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
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
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-montserrat font-bold text-xl shadow-lg shadow-indigo-500/25">
                                        {(profileData?.name || user?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-montserrat font-bold text-lg text-slate-900 dark:text-slate-50">
                                            {profileData?.name || user?.name}
                                        </p>
                                        <p className="font-sans text-sm text-slate-500 dark:text-slate-400">
                                            {profileData?.email || user?.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Update Name */}
                                <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                                    <h2 className="font-montserrat font-bold text-base text-slate-900 dark:text-slate-50 mb-4">
                                        Ubah Nama
                                    </h2>
                                    {nameSuccess && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 mb-4">
                                            <p className="font-sans text-sm text-emerald-400 flex items-center gap-2">
                                                <LuCheck /> {nameSuccess}
                                            </p>
                                        </div>
                                    )}
                                    {nameError && (
                                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2 mb-4">
                                            <p className="font-sans text-sm text-rose-400">{nameError}</p>
                                        </div>
                                    )}
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(nameForm); }}
                                        className="flex gap-3"
                                    >
                                        <div className="relative flex-1">
                                            <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                                            <input
                                                type="text"
                                                value={nameForm.name}
                                                onChange={(e) => setNameForm({ name: e.target.value })}
                                                placeholder="Nama Lengkap"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 font-sans text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={updateProfile.isPending}
                                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl px-5 py-2.5 font-sans font-semibold text-sm hover:opacity-90 transition-opacity shadow-md disabled:opacity-60"
                                        >
                                            {updateProfile.isPending ? <LuLoader className="animate-spin" /> : <LuSave />}
                                            Simpan
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Update Password */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <h2 className="font-montserrat font-bold text-base text-slate-900 dark:text-slate-50 mb-4">
                                    Ubah Password
                                </h2>
                                {passSuccess && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 mb-4">
                                        <p className="font-sans text-sm text-emerald-400 flex items-center gap-2">
                                            <LuCheck /> {passSuccess}
                                        </p>
                                    </div>
                                )}
                                {passError && (
                                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2 mb-4">
                                        <p className="font-sans text-sm text-rose-400">{passError}</p>
                                    </div>
                                )}
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
                                            <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                                            <input
                                                type="password"
                                                value={passForm[f.name]}
                                                onChange={(e) => setPassForm((p) => ({ ...p, [f.name]: e.target.value }))}
                                                placeholder={f.placeholder}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 font-sans text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="submit"
                                        disabled={updatePassword.isPending}
                                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl px-5 py-2.5 font-sans font-semibold text-sm hover:opacity-90 transition-opacity shadow-md disabled:opacity-60"
                                    >
                                        {updatePassword.isPending ? <LuLoader className="animate-spin" /> : <LuLock />}
                                        Ubah Password
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ── Tab: Beli Kuota ── */}
                    {activeTab === 'credit' && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 text-white">
                                <div className="flex items-center gap-3 mb-3">
                                    <LuSparkles className="text-xl" />
                                    <h2 className="font-montserrat font-bold text-lg">
                                        Tambah Kuota Generate
                                    </h2>
                                </div>
                                <p className="font-sans text-sm text-purple-200">
                                    Pilih paket yang sesuai kebutuhanmu. Kuota langsung aktif setelah pembayaran berhasil.
                                </p>
                            </div>

                            {plansLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
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
                            <h2 className="font-montserrat font-bold text-base text-slate-900 dark:text-slate-50">
                                Riwayat Transaksi
                            </h2>
                            {ordersLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : !ordersData?.length ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <LuHistory className="text-slate-400 text-3xl" />
                                    </div>
                                    <p className="font-sans text-sm text-slate-500 dark:text-slate-400">
                                        Belum ada riwayat transaksi.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('credit')}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-sans font-semibold hover:bg-violet-700 transition-colors"
                                    >
                                        <LuShoppingBag className="text-sm" />
                                        Beli Kuota Pertama
                                    </button>
                                </div>
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
                    <div className="bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-700 rounded-2xl p-5 text-white shadow-2xl shadow-purple-500/30">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <LuZap className="text-yellow-300" />
                                <span className="font-montserrat font-bold text-sm">Kuota Kamu</span>
                            </div>
                            <span className="text-xs font-sans text-purple-200">
                                {statsLoading ? '...' : `${pct}% tersisa`}
                            </span>
                        </div>

                        <p className="font-montserrat font-extrabold text-4xl text-white mb-1">
                            {statsLoading ? '...' : remaining}
                        </p>
                        <p className="font-sans text-sm text-purple-200 mb-4">
                            kuota generate gambar tersisa
                        </p>

                        {/* Progress */}
                        <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                            <div
                                className="bg-yellow-300 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs font-sans text-purple-200">
                            <span>Terpakai: {used}</span>
                            <span>Total: {total}</span>
                        </div>

                        {remaining < 5 && (
                            <div className="mt-4 bg-rose-500/20 border border-rose-400/30 rounded-xl p-2.5 text-xs font-sans text-rose-200">
                                ⚠️ Kuota hampir habis! Segera beli paket baru.
                            </div>
                        )}

                        <button
                            onClick={() => setActiveTab('credit')}
                            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 font-sans text-sm font-semibold transition-colors"
                        >
                            <LuShoppingBag className="text-sm" />
                            Tambah Kuota
                        </button>
                    </div>

                    {/* Account Stats */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                        <h3 className="font-montserrat font-bold text-sm text-slate-700 dark:text-slate-300">
                            Statistik Akun
                        </h3>
                        {[
                            { label: 'Chat Sessions', val: stats?.total_chat_sessions ?? 0, icon: '💬' },
                            { label: 'Total Pesan', val: stats?.total_messages ?? 0, icon: '📨' },
                            { label: 'Gambar Di-generate', val: stats?.total_images ?? 0, icon: '🖼️' },
                            { label: 'Transaksi Berhasil', val: stats?.total_paid_orders ?? 0, icon: '✅' },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center justify-between">
                                <span className="font-sans text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <span>{s.icon}</span> {s.label}
                                </span>
                                <span className="font-montserrat font-bold text-sm text-slate-900 dark:text-slate-100">
                                    {statsLoading ? '...' : s.val.toLocaleString('id-ID')}
                                </span>
                            </div>
                        ))}
                    </div>
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

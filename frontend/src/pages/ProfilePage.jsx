import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import useAuthStore from '../stores/authStore';
import { LuUser, LuMail, LuLock, LuLoader, LuCheck, LuSave } from 'react-icons/lu';

export default function ProfilePage() {
    const { user, fetchUser } = useAuthStore();
    const [nameForm, setNameForm] = useState({ name: user?.name || '' });
    const [passForm, setPassForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [nameSuccess, setNameSuccess] = useState('');
    const [passSuccess, setPassSuccess] = useState('');
    const [nameError, setNameError] = useState('');
    const [passError, setPassError] = useState('');

    const { data: profileData } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => { const res = await profileApi.getProfile(); return res.data.data; },
    });

    const updateProfile = useMutation({
        mutationFn: (data) => profileApi.updateProfile(data),
        onSuccess: () => { setNameSuccess('Nama berhasil diperbarui.'); setNameError(''); fetchUser(); setTimeout(() => setNameSuccess(''), 3000); },
        onError: (err) => { setNameError(err.response?.data?.message || 'Gagal update.'); setNameSuccess(''); },
    });

    const updatePassword = useMutation({
        mutationFn: (data) => profileApi.updatePassword(data),
        onSuccess: () => { setPassSuccess('Password berhasil diperbarui.'); setPassError(''); setPassForm({ current_password: '', password: '', password_confirmation: '' }); setTimeout(() => setPassSuccess(''), 3000); },
        onError: (err) => { setPassError(err.response?.data?.message || 'Gagal update password.'); setPassSuccess(''); },
    });

    return (
        <div className="space-y-8 w-full">
            <div>
                <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-slate-900 dark:text-slate-50">Profile</h1>
                <p className="text-slate-500 dark:text-slate-400 font-sans mt-1">Kelola informasi akun kamu.</p>
            </div>

            {/* Profile Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-montserrat font-bold text-xl shadow-lg shadow-indigo-500/25">
                        {(profileData?.name || user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-montserrat font-bold text-lg text-slate-900 dark:text-slate-50">{profileData?.name || user?.name}</p>
                        <p className="font-sans text-sm text-slate-500 dark:text-slate-400">{profileData?.email || user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Update Name */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="font-montserrat font-bold text-lg text-slate-900 dark:text-slate-50 mb-4">Ubah Nama</h2>
                {nameSuccess && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 mb-4"><p className="font-sans text-sm text-emerald-400 flex items-center gap-2"><LuCheck /> {nameSuccess}</p></div>}
                {nameError && <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2 mb-4"><p className="font-sans text-sm text-rose-400">{nameError}</p></div>}
                <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(nameForm); }} className="space-y-4">
                    <div className="relative">
                        <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                        <input name="name" type="text" value={nameForm.name} onChange={(e) => setNameForm({ name: e.target.value })} placeholder="Nama Lengkap" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 font-sans text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                    </div>
                    <button type="submit" disabled={updateProfile.isPending} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl px-5 py-2.5 font-sans font-semibold text-sm hover:opacity-90 transition-opacity shadow-md disabled:opacity-60">
                        {updateProfile.isPending ? <LuLoader className="animate-spin" /> : <LuSave />} Simpan
                    </button>
                </form>
            </div>

            {/* Update Password */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="font-montserrat font-bold text-lg text-slate-900 dark:text-slate-50 mb-4">Ubah Password</h2>
                {passSuccess && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 mb-4"><p className="font-sans text-sm text-emerald-400 flex items-center gap-2"><LuCheck /> {passSuccess}</p></div>}
                {passError && <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2 mb-4"><p className="font-sans text-sm text-rose-400">{passError}</p></div>}
                <form onSubmit={(e) => { e.preventDefault(); updatePassword.mutate(passForm); }} className="space-y-4">
                    <div className="relative">
                        <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                        <input name="current_password" type="password" value={passForm.current_password} onChange={(e) => setPassForm(p => ({ ...p, current_password: e.target.value }))} placeholder="Password saat ini" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 font-sans text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                    </div>
                    <div className="relative">
                        <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                        <input name="password" type="password" value={passForm.password} onChange={(e) => setPassForm(p => ({ ...p, password: e.target.value }))} placeholder="Password baru (min 8 karakter)" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 font-sans text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                    </div>
                    <div className="relative">
                        <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                        <input name="password_confirmation" type="password" value={passForm.password_confirmation} onChange={(e) => setPassForm(p => ({ ...p, password_confirmation: e.target.value }))} placeholder="Konfirmasi password baru" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 font-sans text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                    </div>
                    <button type="submit" disabled={updatePassword.isPending} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl px-5 py-2.5 font-sans font-semibold text-sm hover:opacity-90 transition-opacity shadow-md disabled:opacity-60">
                        {updatePassword.isPending ? <LuLoader className="animate-spin" /> : <LuLock />} Ubah Password
                    </button>
                </form>
            </div>
        </div>
    );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import {
    LuMail,
    LuLock,
    LuEye,
    LuEyeOff,
    LuBrain,
    LuArrowRight,
    LuLoader,
} from "react-icons/lu";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });

    const handleChange = (e) => {
        clearError();
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(form);
            navigate("/dashboard", { replace: true });
        } catch {
            // Error sudah di-set di authStore
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Gradient Orbs */}
            <div
                className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, #6366f1 0%, #3b82f6 60%, transparent 100%)",
                    animation: "floatOrb 8s ease-in-out infinite",
                }}
            />
            <div
                className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 blur-3xl pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, #a855f7 0%, #ec4899 60%, transparent 100%)",
                    animation: "floatOrb 10s ease-in-out infinite reverse",
                }}
            />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 mb-4">
                        <LuBrain className="text-white text-2xl" />
                    </div>
                    <h1 className="font-montserrat font-bold text-2xl text-white tracking-tight">
                        AI ChatBot
                    </h1>
                    <p className="text-slate-400 font-sans text-sm mt-1">
                        Powered by Google Gemini
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/40">
                    <h2 className="font-montserrat font-bold text-xl text-slate-50 mb-1">
                        Selamat datang kembali 👋
                    </h2>
                    <p className="font-sans text-sm text-slate-400 mb-6">
                        Masuk ke akun kamu untuk melanjutkan
                    </p>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-3 mb-5">
                            <p className="font-sans text-sm text-rose-400">{error}</p>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-slate-800" />
                        <span className="font-sans text-xs text-slate-500">masuk dengan email</span>
                        <div className="flex-1 h-px bg-slate-800" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="login-email"
                                className="block font-sans text-sm font-medium text-slate-300"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                                <input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="kamu@email.com"
                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 font-sans text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="login-password"
                                    className="block font-sans text-sm font-medium text-slate-300"
                                >
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl pl-11 pr-12 py-3 font-sans text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? (
                                        <LuEyeOff className="text-lg" />
                                    ) : (
                                        <LuEye className="text-lg" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            id="login-submit-btn"
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-2xl px-6 py-3 font-sans font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <LuLoader className="text-lg animate-spin" />
                                    Masuk...
                                </>
                            ) : (
                                <>
                                    Masuk
                                    <LuArrowRight className="text-lg" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Sign up link */}
                    <p className="font-sans text-sm text-slate-400 text-center mt-6">
                        Belum punya akun?{" "}
                        <Link
                            to="/register"
                            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes floatOrb {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33%       { transform: translate(30px, -20px) scale(1.05); }
                    66%       { transform: translate(-20px, 15px) scale(0.97); }
                }
            `}</style>
        </div>
    );
}

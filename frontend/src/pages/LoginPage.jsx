import { useState } from "react";
import { Link } from "react-router-dom";
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
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // TODO: connect to API
        setTimeout(() => setIsLoading(false), 2000);
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

                    {/* Google OAuth */}
                    <button
                        type="button"
                        className="flex items-center justify-center gap-3 w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-sans font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-5 shadow-sm"
                    >
                        {/* Google Icon SVG */}
                        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                            <path d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.3 5.5-4.8 7.2v6h7.8c4.6-4.2 7.3-10.4 7.3-17.3z" fill="#4285F4"/>
                            <path d="M24 48c6.5 0 12-2.1 16-5.8l-7.8-6c-2.2 1.5-5 2.3-8.2 2.3-6.3 0-11.6-4.2-13.5-10H2.4v6.2C6.4 42.6 14.6 48 24 48z" fill="#34A853"/>
                            <path d="M10.5 28.5c-.5-1.5-.8-3-.8-4.5s.3-3 .8-4.5v-6.2H2.4C.9 16.5 0 20.1 0 24s.9 7.5 2.4 10.7l8.1-6.2z" fill="#FBBC05"/>
                            <path d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.3 30.4 0 24 0 14.6 0 6.4 5.4 2.4 13.3l8.1 6.2C12.4 13.7 17.7 9.5 24 9.5z" fill="#EA4335"/>
                        </svg>
                        Lanjutkan dengan Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-slate-800" />
                        <span className="font-sans text-xs text-slate-500">atau</span>
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
                                <a
                                    href="#"
                                    className="font-sans text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    Lupa password?
                                </a>
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

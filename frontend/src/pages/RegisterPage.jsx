import { useState } from "react";
import { Link } from "react-router-dom";
import {
    LuMail,
    LuLock,
    LuUser,
    LuEye,
    LuEyeOff,
    LuBrain,
    LuArrowRight,
    LuLoader,
    LuCheck,
} from "react-icons/lu";

function PasswordStrength({ password }) {
    const criteria = [
        { label: "Min. 8 karakter", valid: password.length >= 8 },
        { label: "Huruf besar", valid: /[A-Z]/.test(password) },
        { label: "Angka", valid: /[0-9]/.test(password) },
    ];
    const score = criteria.filter((c) => c.valid).length;

    const barColors = [
        "bg-rose-500",
        "bg-amber-500",
        "bg-emerald-500",
    ];

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < score ? barColors[score - 1] : "bg-slate-700"
                        }`}
                    />
                ))}
            </div>
            <div className="flex gap-3 flex-wrap">
                {criteria.map((c) => (
                    <span
                        key={c.label}
                        className={`flex items-center gap-1 font-mono text-xs transition-colors ${
                            c.valid ? "text-emerald-400" : "text-slate-500"
                        }`}
                    >
                        <LuCheck className={`text-xs ${c.valid ? "opacity-100" : "opacity-0"}`} />
                        {c.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const passwordMatch =
        form.password && form.confirmPassword && form.password === form.confirmPassword;
    const passwordMismatch =
        form.confirmPassword && form.password !== form.confirmPassword;

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!passwordMatch || !agreed) return;
        setIsLoading(true);
        // TODO: connect to API
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Gradient Orbs */}
            <div
                className="absolute top-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, #8b5cf6 0%, #ec4899 60%, transparent 100%)",
                    animation: "floatOrb 9s ease-in-out infinite",
                }}
            />
            <div
                className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] rounded-full opacity-15 blur-3xl pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, #3b82f6 0%, #06b6d4 60%, transparent 100%)",
                    animation: "floatOrb 11s ease-in-out infinite reverse",
                }}
            />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md py-6">
                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
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
                        Buat akun baru ✨
                    </h2>
                    <p className="font-sans text-sm text-slate-400 mb-6">
                        Gratis selamanya. Tidak perlu kartu kredit.
                    </p>

                    {/* Google OAuth */}
                    <button
                        type="button"
                        className="flex items-center justify-center gap-3 w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-sans font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-5 shadow-sm"
                    >
                        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                            <path d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.3 5.5-4.8 7.2v6h7.8c4.6-4.2 7.3-10.4 7.3-17.3z" fill="#4285F4"/>
                            <path d="M24 48c6.5 0 12-2.1 16-5.8l-7.8-6c-2.2 1.5-5 2.3-8.2 2.3-6.3 0-11.6-4.2-13.5-10H2.4v6.2C6.4 42.6 14.6 48 24 48z" fill="#34A853"/>
                            <path d="M10.5 28.5c-.5-1.5-.8-3-.8-4.5s.3-3 .8-4.5v-6.2H2.4C.9 16.5 0 20.1 0 24s.9 7.5 2.4 10.7l8.1-6.2z" fill="#FBBC05"/>
                            <path d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.3 30.4 0 24 0 14.6 0 6.4 5.4 2.4 13.3l8.1 6.2C12.4 13.7 17.7 9.5 24 9.5z" fill="#EA4335"/>
                        </svg>
                        Daftar dengan Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-slate-800" />
                        <span className="font-sans text-xs text-slate-500">atau isi form</span>
                        <div className="flex-1 h-px bg-slate-800" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="register-name"
                                className="block font-sans text-sm font-medium text-slate-300"
                            >
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                                <input
                                    id="register-name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 font-sans text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="register-email"
                                className="block font-sans text-sm font-medium text-slate-300"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                                <input
                                    id="register-email"
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
                            <label
                                htmlFor="register-password"
                                className="block font-sans text-sm font-medium text-slate-300"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                                <input
                                    id="register-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Min. 8 karakter"
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
                            <PasswordStrength password={form.password} />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="register-confirm-password"
                                className="block font-sans text-sm font-medium text-slate-300"
                            >
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                                <input
                                    id="register-confirm-password"
                                    name="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Ulangi password"
                                    className={`w-full bg-slate-800/60 border rounded-2xl pl-11 pr-12 py-3 font-sans text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                                        passwordMismatch
                                            ? "border-rose-500/70 focus:ring-rose-500/30"
                                            : passwordMatch
                                            ? "border-emerald-500/70 focus:ring-emerald-500/30"
                                            : "border-slate-700 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    aria-label="Toggle confirm password visibility"
                                >
                                    {showConfirm ? (
                                        <LuEyeOff className="text-lg" />
                                    ) : (
                                        <LuEye className="text-lg" />
                                    )}
                                </button>
                                {passwordMatch && (
                                    <LuCheck className="absolute right-11 top-1/2 -translate-y-1/2 text-emerald-400 text-lg" />
                                )}
                            </div>
                            {passwordMismatch && (
                                <p className="font-sans text-xs text-rose-400 mt-1">
                                    Password tidak cocok
                                </p>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <label
                            htmlFor="register-agree"
                            className="flex items-start gap-3 cursor-pointer group"
                        >
                            <div className="relative flex-shrink-0 mt-0.5">
                                <input
                                    id="register-agree"
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="sr-only"
                                />
                                <div
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                        agreed
                                            ? "bg-gradient-to-br from-blue-500 to-indigo-500 border-indigo-500"
                                            : "bg-slate-800 border-slate-600 group-hover:border-indigo-500/50"
                                    }`}
                                >
                                    {agreed && <LuCheck className="text-white text-xs" />}
                                </div>
                            </div>
                            <span className="font-sans text-xs text-slate-400 leading-relaxed">
                                Saya setuju dengan{" "}
                                <a
                                    href="#"
                                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    Syarat &amp; Ketentuan
                                </a>{" "}
                                dan{" "}
                                <a
                                    href="#"
                                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    Kebijakan Privasi
                                </a>
                            </span>
                        </label>

                        {/* Submit Button */}
                        <button
                            id="register-submit-btn"
                            type="submit"
                            disabled={isLoading || !agreed || passwordMismatch}
                            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-2xl px-6 py-3 font-sans font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <LuLoader className="text-lg animate-spin" />
                                    Membuat akun...
                                </>
                            ) : (
                                <>
                                    Buat Akun
                                    <LuArrowRight className="text-lg" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login link */}
                    <p className="font-sans text-sm text-slate-400 text-center mt-6">
                        Sudah punya akun?{" "}
                        <Link
                            to="/login"
                            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                            Masuk di sini
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

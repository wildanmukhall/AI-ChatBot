import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import {
    LuMail,
    LuLock,
    LuUser,
    LuEye,
    LuEyeOff,
    LuArrowRight,
    LuLoader,
    LuCheck,
} from "react-icons/lu";
import { GlassCard, GlassCardHeader, GlassCardContent, Input, Button } from "@glinui/ui";

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
                            i < score ? barColors[score - 1] : "bg-neutral-800"
                        }`}
                    />
                ))}
            </div>
            <div className="flex gap-3 flex-wrap">
                {criteria.map((c) => (
                    <span
                        key={c.label}
                        className={`flex items-center gap-1 font-mono text-[10px] transition-colors ${
                            c.valid ? "text-emerald-400" : "text-neutral-500"
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
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const passwordMatch =
        form.password && form.password_confirmation && form.password === form.password_confirmation;
    const passwordMismatch =
        form.password_confirmation && form.password !== form.password_confirmation;

    const handleChange = (e) => {
        clearError();
        setFieldErrors({});
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!passwordMatch || !agreed) return;

        try {
            await register(form);
            navigate("/login", { replace: true });
        } catch (err) {
            if (err.errors) {
                setFieldErrors(err.errors);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A09] flex items-center justify-center p-4 relative overflow-hidden z-0">
            {/* Animated Gradient Orbs */}
            <div
                className="absolute top-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full opacity-20 blur-[100px] pointer-events-none"
                style={{
                    background: "radial-gradient(circle, #facc15 0%, #ea580c 60%, transparent 100%)",
                    animation: "floatOrb 9s ease-in-out infinite",
                }}
            />
            <div
                className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] rounded-full opacity-15 blur-[100px] pointer-events-none"
                style={{
                    background: "radial-gradient(circle, #fbbf24 0%, #f97316 60%, transparent 100%)",
                    animation: "floatOrb 11s ease-in-out infinite reverse",
                }}
            />

            {/* Content */}
            <div className="relative z-20 w-full max-w-md py-6 px-4">
                {/* Title Above Card (Gradient text as per DESIGN.md section 3.B) */}
                <h1 className="font-sans font-extrabold text-4xl md:text-5xl tracking-widest bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent text-center uppercase mb-8 drop-shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                    AI CHAT BOT
                </h1>

                {/* Glin UI GlassCard */}
                <GlassCard className="w-full p-6 md:p-8 animate-slide-up">
                    <GlassCardHeader className="space-y-2 mb-6">
                        <h2 className="font-sans font-medium text-sm tracking-wide text-neutral-400 uppercase">
                            Buat Akun Baru ✨
                        </h2>
                        <p className="font-sans font-normal text-sm tracking-wide text-neutral-200">
                            Gratis selamanya. Tidak perlu kartu kredit.
                        </p>
                    </GlassCardHeader>

                    <GlassCardContent>
                        {/* Error Alert */}
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3 mb-6">
                                <p className="font-sans font-normal text-sm text-rose-400">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="register-name"
                                    className="block font-sans text-xs text-neutral-500"
                                >
                                    Nama Lengkap
                                </label>
                                <div className="relative">
                                    <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg z-10" />
                                    <Input
                                        id="register-name"
                                        name="name"
                                        type="text"
                                        variant="glass"
                                        autoComplete="name"
                                        required
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="h-11 pl-11 pr-4 rounded-2xl focus-visible:ring-amber-500/30 focus-visible:border-amber-500/60 transition-all text-white placeholder-neutral-500 bg-none bg-[#161615]/45 border-white/8 backdrop-blur-md"
                                    />
                                </div>
                                {fieldErrors.name && (
                                    <p className="font-sans font-normal text-xs text-rose-400 mt-1">{fieldErrors.name[0]}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="register-email"
                                    className="block font-sans text-xs text-neutral-500"
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg z-10" />
                                    <Input
                                        id="register-email"
                                        name="email"
                                        type="email"
                                        variant="glass"
                                        autoComplete="email"
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="kamu@email.com"
                                        className="h-11 pl-11 pr-4 rounded-2xl focus-visible:ring-amber-500/30 focus-visible:border-amber-500/60 transition-all text-white placeholder-neutral-500 bg-none bg-[#161615]/45 border-white/8 backdrop-blur-md"
                                    />
                                </div>
                                {fieldErrors.email && (
                                    <p className="font-sans font-normal text-xs text-rose-400 mt-1">{fieldErrors.email[0]}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="register-password"
                                    className="block font-sans text-xs text-neutral-500"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg z-10" />
                                    <Input
                                        id="register-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        variant="glass"
                                        autoComplete="new-password"
                                        required
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Min. 8 karakter"
                                        className="h-11 pl-11 pr-12 rounded-2xl focus-visible:ring-amber-500/30 focus-visible:border-amber-500/60 transition-all text-white placeholder-neutral-500 bg-none bg-[#161615]/45 border-white/8 backdrop-blur-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors z-10"
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
                            <div className="space-y-2">
                                <label
                                    htmlFor="register-confirm-password"
                                    className="block font-sans text-xs text-neutral-500"
                                >
                                    Konfirmasi Password
                                </label>
                                <div className="relative">
                                    <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg z-10" />
                                    <Input
                                        id="register-confirm-password"
                                        name="password_confirmation"
                                        type={showConfirm ? "text" : "password"}
                                        variant="glass"
                                        autoComplete="new-password"
                                        required
                                        value={form.password_confirmation}
                                        onChange={handleChange}
                                        placeholder="Ulangi password"
                                        className={`h-11 pl-11 pr-12 rounded-2xl focus-visible:ring-offset-0 transition-all text-white placeholder-neutral-500 bg-none bg-[#161615]/45 backdrop-blur-md ${
                                            passwordMismatch
                                                ? "border-rose-500/50 focus-visible:ring-2 focus-visible:ring-rose-500/22 focus-visible:border-rose-500"
                                                : passwordMatch
                                                ? "border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/22 focus-visible:border-emerald-500"
                                                : "border-white/8 focus-visible:ring-2 focus-visible:ring-amber-500/22 focus-visible:border-amber-500"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors z-10"
                                        aria-label="Toggle confirm password visibility"
                                    >
                                        {showConfirm ? (
                                            <LuEyeOff className="text-lg" />
                                        ) : (
                                            <LuEye className="text-lg" />
                                        )}
                                    </button>
                                    {passwordMatch && (
                                        <LuCheck className="absolute right-11 top-1/2 -translate-y-1/2 text-emerald-400 text-lg z-10" />
                                    )}
                                </div>
                                {passwordMismatch && (
                                    <p className="font-sans font-normal text-xs text-rose-400 mt-1">
                                        Password tidak cocok
                                    </p>
                                )}
                            </div>

                            {/* Terms Checkbox */}
                            <label
                                htmlFor="register-agree"
                                className="flex items-start gap-3 cursor-pointer group pt-2"
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
                                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                            agreed
                                                ? "bg-amber-500 border-amber-500"
                                                : "border-white/20 group-hover:border-amber-500/50"
                                        }`}
                                    >
                                        {agreed && <LuCheck className="text-black text-xs font-bold" />}
                                    </div>
                                </div>
                                <span className="font-sans font-normal text-xs text-neutral-500 leading-relaxed">
                                    Saya setuju dengan{" "}
                                    <a
                                        href="#"
                                        className="text-amber-500 hover:text-amber-400 transition-colors"
                                    >
                                        Syarat &amp; Ketentuan
                                    </a>{" "}
                                    dan{" "}
                                    <a
                                        href="#"
                                        className="text-amber-500 hover:text-amber-400 transition-colors"
                                    >
                                        Kebijakan Privasi
                                    </a>
                                </span>
                            </label>

                            {/* Submit Button with Glin UI button base & custom gradients */}
                            <div className="pt-2">
                                <Button
                                    id="register-submit-btn"
                                    type="submit"
                                    disabled={isLoading || !agreed || passwordMismatch}
                                    className="h-11 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-black font-semibold rounded-full shadow-lg shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2 transition-all border-none"
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
                                </Button>
                            </div>
                        </form>

                        {/* Login link */}
                        <p className="font-sans font-normal text-xs text-neutral-500 text-center mt-6">
                            Sudah punya akun?{" "}
                            <Link
                                to="/login"
                                className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
                            >
                                Masuk di sini
                            </Link>
                        </p>
                    </GlassCardContent>
                </GlassCard>
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

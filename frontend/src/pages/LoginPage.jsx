import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import {
    LuMail,
    LuLock,
    LuEye,
    LuEyeOff,
    LuArrowRight,
    LuLoader,
} from "react-icons/lu";
import { GlassCard, GlassCardHeader, GlassCardContent, Input, Button } from "@glinui/ui";

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
        <div className="min-h-screen bg-[#0A0A09] flex items-center justify-center p-4 relative overflow-hidden z-0">
            {/* Animated Gradient Orbs (True Dark Vibe with Golden Glow) */}
            <div
                className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, #facc15 0%, #f97316 60%, transparent 100%)",
                    animation: "floatOrb 8s ease-in-out infinite",
                }}
            />
            <div
                className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 blur-[100px] pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, #fbbf24 0%, #ea580c 60%, transparent 100%)",
                    animation: "floatOrb 10s ease-in-out infinite reverse",
                }}
            />

            {/* Content */}
            <div className="relative z-20 w-full max-w-md px-4">
                {/* Title Above Card (Gradient text as per DESIGN.md section 3.B) */}
                <h1 className="font-sans font-extrabold text-4xl md:text-5xl tracking-widest bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent text-center uppercase mb-8 drop-shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                    AI CHAT BOT
                </h1>

                {/* Glin UI GlassCard */}
                <GlassCard className="w-full p-6 md:p-8 animate-slide-up">
                    <GlassCardHeader className="space-y-2 mb-6">
                        <h2 className="font-sans font-medium text-sm tracking-wide text-neutral-400 uppercase">
                            Welcome Back
                        </h2>
                        <p className="font-sans font-normal text-sm tracking-wide text-neutral-200">
                            Masuk ke akun kamu untuk melanjutkan
                        </p>
                    </GlassCardHeader>

                    <GlassCardContent>
                        {/* Error Alert (Using failure states as per section 3.C) */}
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3 mb-6">
                                <p className="font-sans font-normal text-sm text-rose-400">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="login-email"
                                    className="block font-sans text-xs text-neutral-500"
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg z-10" />
                                    <Input
                                        id="login-email"
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
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="login-password"
                                    className="block font-sans text-xs text-neutral-500"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg z-10" />
                                    <Input
                                        id="login-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        variant="glass"
                                        autoComplete="current-password"
                                        required
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
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
                            </div>

                            {/* Submit Button with Glin UI button base & custom gradients */}
                            <div className="pt-2">
                                <Button
                                    id="login-submit-btn"
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-11 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-black font-semibold rounded-full shadow-lg shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2 transition-all border-none"
                                >
                                    {isLoading ? (
                                        <>
                                            <LuLoader className="text-lg animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Masuk
                                            <LuArrowRight className="text-lg" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>

                        {/* Sign up link */}
                        <p className="font-sans font-normal text-xs text-neutral-500 text-center mt-6">
                            Belum punya akun?{" "}
                            <Link
                                to="/register"
                                className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
                            >
                                Daftar sekarang
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

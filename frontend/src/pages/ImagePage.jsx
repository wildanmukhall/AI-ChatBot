import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateImage, getImageStatus } from "../api/imageApi";
import useQuotaStore from '../stores/quotaStore';
import {
    LuSparkles,
    LuImage,
    LuDownload,
    LuLoader,
    LuPenTool,
    LuZap,
    LuRefreshCw,
    LuCopy,
    LuCheck,
} from "react-icons/lu";
import { GlassCard, Button } from "@glinui/ui";
import { gooeyToast } from 'goey-toast';

// Style presets
const STYLE_PRESETS = [
    { id: "photorealistic", label: "Photorealistic", emoji: "📸" },
    { id: "digital-art", label: "Digital Art", emoji: "🎨" },
    { id: "anime", label: "Anime", emoji: "✨" },
    { id: "oil-painting", label: "Oil Painting", emoji: "🖼️" },
    { id: "watercolor", label: "Watercolor", emoji: "💧" },
    { id: "sketch", label: "Sketch", emoji: "✏️" },
    { id: "3d-render", label: "3D Render", emoji: "🧊" },
    { id: "cinematic", label: "Cinematic", emoji: "🎬" },
];

const PROMPT_SUGGESTIONS = [
    "A futuristic city at sunset with flying cars and neon lights",
    "Cozy cabin in snowy forest, warm light through windows",
    "Abstract fluid art with gold and navy blue swirls",
    "Portrait of a wise old wizard with glowing staff",
    "Underwater coral reef with colorful tropical fish",
    "Minimalist Japanese zen garden at golden hour",
];

export default function ImagePage() {
    const [prompt, setPrompt] = useState("");
    const [selectedStyle, setSelectedStyle] = useState("photorealistic");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [activeImage, setActiveImage] = useState(null);

    const [generatingStatus, setGeneratingStatus] = useState("Submitting your request...");

    const navigate = useNavigate();
    const { remaining: quotaRemaining, fetchQuota, decrementQuota } = useQuotaStore();

    useEffect(() => {
        fetchQuota();
    }, [fetchQuota]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || isGenerating) return;

        if (quotaRemaining !== null && quotaRemaining <= 0) {
            gooeyToast.error('Kuota generate gambar habis! Silakan tambah kuota di profil Anda.');
            return;
        }

        setIsGenerating(true);
        setGeneratingStatus("Submitting your request...");
        try {
            const styleLabel = STYLE_PRESETS.find((s) => s.id === selectedStyle)?.label;
            const finalPrompt = selectedStyle !== "photorealistic" ? `${prompt}, ${styleLabel} style` : prompt;
            
            const reqData = {
                prompt: finalPrompt,
                width: 1024,
                height: 1024,
            };
            
            const response = await generateImage(reqData);
            const imageId = response.data.id;
            
            setGeneratingStatus("Image is being generated, please wait...");

            // Poll with timeout: max 120 seconds (40 attempts × 3s)
            let attempts = 0;
            const MAX_ATTEMPTS = 40;
            let finalImageUrl = null;
            
            while (attempts < MAX_ATTEMPTS) {
                await new Promise(r => setTimeout(r, 3000));
                attempts++;

                const statusRes = await getImageStatus(imageId);
                const status = statusRes.data.status;

                if (status === 'completed') {
                    finalImageUrl = statusRes.data.image_url;
                    break;
                } else if (status === 'failed') {
                    throw new Error(statusRes.data.error_message || "Generation failed on server.");
                }
                // still processing — keep polling
                setGeneratingStatus(`Still generating... (${attempts * 3}s)`);
            }

            if (!finalImageUrl) {
                throw new Error("Generation timed out after 2 minutes.");
            }

            const newImage = {
                id: imageId,
                url: finalImageUrl,
                prompt,
                style: selectedStyle,
                ratio: "1:1",
            };

            setGeneratedImages((prev) => [newImage, ...prev]);
            setActiveImage(newImage);
            setIsGenerating(false);
            decrementQuota();
            gooeyToast.success('Gambar berhasil di-generate!');
        } catch (error) {
            console.error(error);
            const msg = error.message || error.response?.data?.message || "Failed to generate image.";
            gooeyToast.error(msg);
            setIsGenerating(false);
        }
    };

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(prompt);
        setCopiedPrompt(true);
        gooeyToast.success('Prompt disalin ke clipboard!');
        setTimeout(() => setCopiedPrompt(false), 2000);
    };

    const handleSuggestion = (s) => setPrompt(s);

    return (
        <div className="w-full min-h-screen">
            {/* ── Hero header ── */}
            <GlassCard className="relative overflow-hidden mb-8 p-8 border border-white/8 shadow-2xl shadow-black/80 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                {/* Glowing Orbs */}
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                                <LuPenTool className="text-amber-500 text-xl" />
                            </div>
                            <span className="text-neutral-400 font-sans text-xs font-semibold uppercase tracking-widest">
                                AI Image Generator
                            </span>
                        </div>
                        <h1 className="font-sans font-bold text-3xl md:text-4xl text-white mb-2">
                            Ubah Ide Anda Menjadi
                            <span className="block bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                Visual yang Memukau
                            </span>
                        </h1>
                        <p className="font-sans text-neutral-400 text-sm max-w-md leading-relaxed">
                            Jelaskan apa yang ingin Anda lihat dan AI kami akan mewujudkannya dalam hitungan detik. Didukung oleh Gemini AI.
                        </p>
                    </div>

                    {/* Quota indicator */}
                    <div className="shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-md">
                        <LuZap className="text-amber-500 text-2xl animate-pulse" />
                        <div className="flex flex-col">
                            <span className="font-sans font-extrabold text-2xl text-white leading-none">
                                {quotaRemaining ?? '...'}
                            </span>
                            <span className="font-sans text-xs text-neutral-400">kuota tersisa</span>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div className="flex flex-col xl:flex-row gap-6">
                {/* ── LEFT: Controls ── */}
                <div className="xl:w-96 shrink-0 space-y-5">
                    {/* Prompt form */}
                    <GlassCard className="p-5">
                        <label className="block font-sans font-semibold text-sm text-white mb-3">
                            Describe your image
                        </label>
                        <form onSubmit={handleGenerate} className="space-y-3">
                            <div className="relative">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="A majestic lion standing on a cliff at sunrise, cinematic lighting, ultra detailed..."
                                    rows={4}
                                    className="w-full bg-none bg-[#161615]/45 border border-white/8 backdrop-blur-md rounded-2xl px-4 py-3 font-sans text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/60 transition-all resize-none"
                                />
                                {prompt && (
                                    <button
                                        type="button"
                                        onClick={handleCopyPrompt}
                                        className="absolute bottom-3 right-3 flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-white/5"
                                    >
                                        {copiedPrompt ? (
                                            <LuCheck className="text-sm text-emerald-500" />
                                        ) : (
                                            <LuCopy className="text-sm" />
                                        )}
                                    </button>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={!prompt.trim() || isGenerating}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black rounded-xl py-3 font-sans font-semibold text-sm transition-all border-none shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isGenerating ? (
                                    <>
                                        <LuLoader className="text-lg animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <LuSparkles className="text-lg" />
                                        Generate Image
                                    </>
                                )}
                            </Button>
                        </form>
                    </GlassCard>

                    {/* Style presets */}
                    <GlassCard className="p-5">
                        <p className="font-sans font-semibold text-sm text-white mb-3">
                            Style
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {STYLE_PRESETS.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-sans text-sm font-medium transition-all border cursor-pointer ${
                                        selectedStyle === style.id
                                            ? "bg-amber-500/10 border-amber-500/40 text-amber-500"
                                            : "border-white/5 text-neutral-400 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    <span>{style.emoji}</span>
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Prompt suggestions */}
                    <GlassCard className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <LuZap className="text-amber-500 text-sm" />
                            <p className="font-sans font-semibold text-sm text-white">
                                Prompt Ideas
                            </p>
                        </div>
                        <div className="space-y-2">
                            {PROMPT_SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestion(s)}
                                    className="w-full text-left px-3 py-2 rounded-xl font-sans text-xs text-neutral-400 hover:bg-white/5 hover:text-white transition-colors border border-transparent hover:border-white/10 cursor-pointer"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* ── RIGHT: Gallery ── */}
                <div className="flex-1 min-w-0">
                    {isGenerating ? (
                        /* Loading skeleton */
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <LuLoader className="text-amber-500 text-xl animate-spin" />
                                <span className="font-sans text-sm text-neutral-400">
                                    {generatingStatus}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-2xl bg-neutral-900/40 border border-white/5 animate-pulse"
                                        style={{ aspectRatio: "1 / 1" }}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : generatedImages.length === 0 ? (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center h-full min-h-96 text-center">
                            <div className="relative mb-6">
                                <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/20">
                                    <LuImage className="text-amber-500 text-4xl" />
                                </div>
                                <div className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg">
                                    <LuSparkles className="text-black text-sm" />
                                </div>
                            </div>
                            <h2 className="font-sans font-bold text-xl text-white mb-2">
                                Your canvas awaits
                            </h2>
                            <p className="font-sans text-sm text-neutral-500 max-w-xs leading-relaxed">
                                Jelasakan visi Anda di panel sebelah kiri dan klik tombol Generate untuk membuat visual yang indah.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Active / featured image */}
                            {activeImage && (
                                <div className="relative group rounded-3xl overflow-hidden shadow-2xl border border-white/8 bg-[#161615]/45 backdrop-blur-md">
                                    <img
                                        src={activeImage.url}
                                        alt={activeImage.prompt}
                                        className="w-full object-cover"
                                        style={{ maxHeight: "480px" }}
                                    />
                                    {/* Overlay actions */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                                        <div className="flex-1 min-w-0 mr-3">
                                            <p className="font-sans text-sm text-white/90 truncate">
                                                {activeImage.prompt}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="font-mono text-xs text-white/60">
                                                    {activeImage.style}
                                                </span>
                                                <span className="text-white/40">
                                                    ·
                                                </span>
                                                <span className="font-mono text-xs text-white/60">
                                                    {activeImage.ratio}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    setPrompt(
                                                        activeImage.prompt,
                                                    )
                                                }
                                                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors cursor-pointer border border-white/10"
                                                title="Gunakan prompt ini"
                                            >
                                                <LuRefreshCw className="text-base" />
                                            </button>
                                            <a
                                                href={activeImage.url}
                                                download="generated-image.jpg"
                                                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors border border-white/10"
                                                title="Download"
                                            >
                                                <LuDownload className="text-base" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Grid thumbnails */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {generatedImages.map((img) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative group rounded-2xl overflow-hidden transition-all cursor-pointer ${
                                            activeImage?.id === img.id
                                                ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-[#0A0A09]"
                                                : "hover:scale-[1.02]"
                                        }`}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.prompt}
                                            className="w-full h-28 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

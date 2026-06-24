import { useState } from "react";
import { generateImage, getImageStatus } from "../api/imageApi";
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

// Style presets Freepik-style
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

const ASPECT_RATIOS = [
    { id: "1:1", label: "Square", icon: "⬜", w: 1024, h: 1024 },
    { id: "16:9", label: "Landscape", icon: "🖥️", w: 1024, h: 512 },
    { id: "9:16", label: "Portrait", icon: "📱", w: 512, h: 1024 },
    { id: "4:3", label: "Classic", icon: "📺", w: 1024, h: 768 },
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
    const [selectedRatio, setSelectedRatio] = useState("1:1");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [activeImage, setActiveImage] = useState(null);

    const [generatingStatus, setGeneratingStatus] = useState("Submitting your request...");

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || isGenerating) return;

        setIsGenerating(true);
        setGeneratingStatus("Submitting your request...");
        try {
            
            const ratio = ASPECT_RATIOS.find((r) => r.id === selectedRatio);
            const styleLabel = STYLE_PRESETS.find((s) => s.id === selectedStyle)?.label;
            const finalPrompt = selectedStyle !== "photorealistic" ? `${prompt}, ${styleLabel} style` : prompt;
            
            const reqData = {
                prompt: finalPrompt,
                width: ratio.w,
                height: ratio.h,
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
                throw new Error("Generation timed out after 2 minutes. The queue worker may not be running.");
            }

            const newImage = {
                id: imageId,
                url: finalImageUrl,
                prompt,
                style: selectedStyle,
                ratio: selectedRatio,
            };

            setGeneratedImages((prev) => [newImage, ...prev]);
            setActiveImage(newImage);
            setIsGenerating(false);
        } catch (error) {
            console.error(error);
            const msg = error.message || error.response?.data?.message || "Failed to generate image.";
            alert(msg);
            setIsGenerating(false);
        }
    };


    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(prompt);
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 2000);
    };

    const handleSuggestion = (s) => setPrompt(s);

    return (
        <div className="w-full min-h-screen">
            {/* ── Hero header ── */}
            <div className="relative overflow-hidden rounded-3xl mb-8 bg-linear-to-br from-violet-600 via-purple-600 to-indigo-600 p-8 md:p-12 shadow-2xl shadow-purple-500/20">
                {/* Decorative blobs */}
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-pink-500/20 blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm">
                                <LuPenTool className="text-white text-xl" />
                            </div>
                            <span className="text-purple-200 font-sans text-sm font-semibold uppercase tracking-widest">
                                AI Image Generator
                            </span>
                        </div>
                        <h1 className="font-montserrat font-bold text-3xl md:text-4xl text-white mb-2">
                            Turn your ideas into
                            <span className="block bg-clip-text text-transparent bg-linear-to-r from-pink-300 to-yellow-200">
                                stunning visuals
                            </span>
                        </h1>
                        <p className="font-sans text-purple-200 text-sm md:text-base max-w-md">
                            Describe anything and our AI will bring it to life
                            in seconds. Powered by Gemini AI.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 md:gap-6">
                        {[
                            { val: "10M+", label: "Images" },
                            { val: "500K+", label: "Users" },
                            { val: "4.9★", label: "Rating" },
                        ].map((s) => (
                            <div key={s.label} className="text-center">
                                <p className="font-montserrat font-bold text-2xl text-white">
                                    {s.val}
                                </p>
                                <p className="font-sans text-xs text-purple-300">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                {/* ── LEFT: Controls ── */}
                <div className="xl:w-96 shrink-0 space-y-5">
                    {/* Prompt form */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <label className="block font-montserrat font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3">
                            Describe your image
                        </label>
                        <form onSubmit={handleGenerate} className="space-y-3">
                            <div className="relative">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="A majestic lion standing on a cliff at sunrise, cinematic lighting, ultra detailed..."
                                    rows={4}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-sans text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                                />
                                {prompt && (
                                    <button
                                        type="button"
                                        onClick={handleCopyPrompt}
                                        className="absolute bottom-3 right-3 flex items-center justify-center w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        {copiedPrompt ? (
                                            <LuCheck className="text-sm text-emerald-500" />
                                        ) : (
                                            <LuCopy className="text-sm" />
                                        )}
                                    </button>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={!prompt.trim() || isGenerating}
                                className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-xl py-3 font-sans font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            </button>
                        </form>
                    </div>

                    {/* Style presets */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <p className="font-montserrat font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3">
                            Style
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {STYLE_PRESETS.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-sans text-sm font-medium transition-all border ${
                                        selectedStyle === style.id
                                            ? "bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-300"
                                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                    }`}
                                >
                                    <span>{style.emoji}</span>
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Aspect ratio */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <p className="font-montserrat font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3">
                            Aspect Ratio
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {ASPECT_RATIOS.map((ratio) => (
                                <button
                                    key={ratio.id}
                                    onClick={() => setSelectedRatio(ratio.id)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-sans text-sm font-medium transition-all border ${
                                        selectedRatio === ratio.id
                                            ? "bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-300"
                                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                    }`}
                                >
                                    <span className="text-base">
                                        {ratio.icon}
                                    </span>
                                    <span>
                                        <span className="font-mono text-xs">
                                            {ratio.id}
                                        </span>
                                        <span className="ml-1 opacity-60">
                                            {ratio.label}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Prompt suggestions */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <LuZap className="text-amber-500 text-sm" />
                            <p className="font-montserrat font-semibold text-sm text-slate-700 dark:text-slate-300">
                                Prompt Ideas
                            </p>
                        </div>
                        <div className="space-y-2">
                            {PROMPT_SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestion(s)}
                                    className="w-full text-left px-3 py-2 rounded-xl font-sans text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Gallery ── */}
                <div className="flex-1 min-w-0">
                    {isGenerating ? (
                        /* Loading skeleton */
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <LuLoader className="text-purple-500 text-xl animate-spin" />
                                <span className="font-sans text-sm text-slate-500">
                                    {generatingStatus}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
                                        style={{ aspectRatio: "1 / 1" }}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : generatedImages.length === 0 ? (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center h-full min-h-96 text-center">
                            <div className="relative mb-6">
                                <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-500/10 dark:to-purple-500/10">
                                    <LuImage className="text-purple-500 text-4xl" />
                                </div>
                                <div className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-r from-pink-500 to-rose-500 shadow-lg">
                                    <LuSparkles className="text-white text-sm" />
                                </div>
                            </div>
                            <h2 className="font-montserrat font-bold text-xl text-slate-900 dark:text-slate-50 mb-2">
                                Your canvas awaits
                            </h2>
                            <p className="font-sans text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                                Describe your vision on the left and click
                                Generate to see the magic unfold.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Active / featured image */}
                            {activeImage && (
                                <div className="relative group rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-200 dark:border-slate-800">
                                    <img
                                        src={activeImage.url}
                                        alt={activeImage.prompt}
                                        className="w-full object-cover"
                                        style={{ maxHeight: "480px" }}
                                    />
                                    {/* Overlay actions */}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
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
                                                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                                                title="Gunakan prompt ini"
                                            >
                                                <LuRefreshCw className="text-base" />
                                            </button>
                                            <a
                                                href={activeImage.url}
                                                download="generated-image.jpg"
                                                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
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
                                        className={`relative group rounded-2xl overflow-hidden transition-all ${
                                            activeImage?.id === img.id
                                                ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950"
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

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    LuImage,
    LuSearch,
    LuFilter,
    LuTrash2,
    LuDownload,
    LuLoader,
    LuX,
    LuChevronLeft,
    LuChevronRight,
    LuCalendar,
    LuSparkles,
    LuRefreshCw,

    LuCircleAlert,
    LuImages,
    LuClock,
    LuCheck,
    LuCircleX,
    LuZoomIn,
} from "react-icons/lu";
import { getImages, deleteImage } from "../api/imageApi";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    completed: {
        label: "Completed",
        icon: LuCheck,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        dot: "bg-emerald-500",
    },
    processing: {
        label: "Processing",
        icon: LuClock,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        dot: "bg-amber-500 animate-pulse",
    },
    failed: {
        label: "Failed",
        icon: LuCircleX,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
        dot: "bg-rose-500",
    },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.processing;
    const Icon = cfg.icon;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ image, onClose, onDelete, isDeleting }) {
    useEffect(() => {
        const handler = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    if (!image) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
            onClick={onClose}
        >
            <div
                className="relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col md:flex-row max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image panel */}
                <div className="flex-1 bg-slate-950 flex items-center justify-center min-h-64 md:min-h-0 overflow-hidden">
                    {image.image_url ? (
                        <img
                            src={image.image_url}
                            alt={image.prompt}
                            className="w-full h-full object-contain max-h-[60vh] md:max-h-[80vh]"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 p-8 text-slate-500">
                            <LuClock className="text-4xl animate-pulse text-amber-400" />
                            <p className="font-sans text-sm text-center">
                                {image.status === "failed"
                                    ? "Generation failed"
                                    : "Image is being generated..."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Info panel */}
                <div className="w-full md:w-80 shrink-0 flex flex-col overflow-y-auto">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-montserrat font-bold text-slate-900 dark:text-slate-100 text-sm">
                            Detail Gambar
                        </h3>
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <LuX className="text-base" />
                        </button>
                    </div>

                    <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                        {/* Status */}
                        <div>
                            <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Status</p>
                            <StatusBadge status={image.status} />
                        </div>

                        {/* Prompt */}
                        <div>
                            <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Prompt</p>
                            <p className="font-sans text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                                {image.prompt}
                            </p>
                        </div>

                        {/* Dimensions */}
                        {(image.width || image.height) && (
                            <div>
                                <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Ukuran</p>
                                <p className="font-mono text-sm text-slate-700 dark:text-slate-300">
                                    {image.width} × {image.height}px
                                </p>
                            </div>
                        )}

                        {/* Dates */}
                        <div>
                            <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Dibuat</p>
                            <p className="font-sans text-sm text-slate-700 dark:text-slate-300">
                                {formatDate(image.created_at)}
                            </p>
                        </div>

                        {image.completed_at && (
                            <div>
                                <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Selesai</p>
                                <p className="font-sans text-sm text-slate-700 dark:text-slate-300">
                                    {formatDate(image.completed_at)}
                                </p>
                            </div>
                        )}

                        {/* Error message */}
                        {image.status === "failed" && image.error_message && (
                            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3">
                                <div className="flex items-start gap-2">
                                    <LuCircleAlert className="text-rose-500 text-sm shrink-0 mt-0.5" />
                                    <p className="font-sans text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                                        {image.error_message}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                        {image.image_url && (
                            <a
                                href={image.image_url}
                                download={`generated-${image.id}.png`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-sans font-medium hover:bg-violet-700 transition-colors"
                            >
                                <LuDownload className="text-sm" />
                                Download
                            </a>
                        )}
                        <button
                            onClick={() => onDelete(image.id)}
                            disabled={isDeleting}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-sm font-sans font-medium hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <LuLoader className="text-sm animate-spin" />
                            ) : (
                                <LuTrash2 className="text-sm" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Image Card ─────────────────────────────────────────────────────────────────

function ImageCard({ image, onSelect, onDelete, isDeleting }) {
    return (
        <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300">
            {/* Image thumbnail */}
            <div
                className="relative aspect-square bg-slate-100 dark:bg-slate-800 cursor-pointer overflow-hidden"
                onClick={() => onSelect(image)}
            >
                {image.image_url ? (
                    <>
                        <img
                            src={image.image_url}
                            alt={image.prompt}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white rounded-full px-4 py-2">
                                <LuZoomIn className="text-sm" />
                                <span className="text-xs font-sans font-medium">Lihat Detail</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        {image.status === "processing" ? (
                            <>
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                                        <LuSparkles className="text-amber-500 text-xl animate-pulse" />
                                    </div>
                                </div>
                                <p className="font-sans text-xs text-slate-400 text-center px-3">
                                    Generating...
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
                                    <LuCircleX className="text-rose-500 text-xl" />
                                </div>
                                <p className="font-sans text-xs text-slate-400 text-center px-3">
                                    Failed
                                </p>
                            </>
                        )}
                    </div>
                )}

                {/* Status badge on image */}
                <div className="absolute top-2 left-2">
                    <StatusBadge status={image.status} />
                </div>
            </div>

            {/* Footer */}
            <div className="p-3">
                <p className="font-sans text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                    {image.prompt}
                </p>
                <div className="flex items-center justify-between">
                    <span className="font-sans text-xs text-slate-400 dark:text-slate-500">
                        {formatDate(image.created_at).split(",")[0]}
                    </span>
                    <div className="flex items-center gap-1">
                        {image.image_url && (
                            <a
                                href={image.image_url}
                                download={`generated-${image.id}.png`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                                title="Download"
                            >
                                <LuDownload className="text-xs" />
                            </a>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(image.id);
                            }}
                            disabled={isDeleting}
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-50"
                            title="Hapus"
                        >
                            {isDeleting ? (
                                <LuLoader className="text-xs animate-spin" />
                            ) : (
                                <LuTrash2 className="text-xs" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function GalleryPage() {
    const navigate = useNavigate();

    // ── State ────────────────────────────────────────────────────────────────
    const [images, setImages] = useState([]);
    const [meta, setMeta] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [selectedImage, setSelectedImage] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const searchTimeout = useRef(null);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchImages = useCallback(
        async ({ page = 1, silent = false } = {}) => {
            if (!silent) setIsLoading(true);
            else setIsRefreshing(true);
            setError(null);

            try {
                const params = {
                    page,
                    per_page: 12,
                    sort_by: "created_at",
                    sort_order: sortOrder,
                };
                if (search.trim()) params.search = search.trim();
                if (statusFilter) params.status = statusFilter;
                if (dateFrom) params.date_from = dateFrom;
                if (dateTo) params.date_to = dateTo;

                const res = await getImages(params);
                setImages(res.data || []);
                setMeta(res.meta || null);
                setCurrentPage(page);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || "Gagal memuat galeri.");
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [search, statusFilter, dateFrom, dateTo, sortOrder]
    );

    // Initial fetch & refetch on filter changes
    useEffect(() => {
        // Debounce search
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchImages({ page: 1 });
        }, 400);
        return () => clearTimeout(searchTimeout.current);
    }, [fetchImages]);

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await deleteImage(id);
            setImages((prev) => prev.filter((img) => img.id !== id));
            if (selectedImage?.id === id) setSelectedImage(null);
            setConfirmDeleteId(null);
        } catch (err) {
            alert(err.response?.data?.message || "Gagal menghapus gambar.");
        } finally {
            setDeletingId(null);
        }
    };

    const requestDelete = (id) => {
        setConfirmDeleteId(id);
    };

    // ── Pagination ────────────────────────────────────────────────────────────
    const goToPage = (page) => {
        if (page < 1 || (meta && page > meta.last_page)) return;
        fetchImages({ page, silent: false });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ── Active filter count ───────────────────────────────────────────────────
    const activeFilters = [statusFilter, dateFrom, dateTo].filter(Boolean).length;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="w-full min-h-screen">
            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-8 md:p-10 shadow-2xl shadow-purple-500/20">
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute top-6 right-24 w-40 h-40 rounded-full bg-pink-500/15 blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm">
                                <LuImages className="text-white text-xl" />
                            </div>
                            <span className="text-purple-200 font-sans text-sm font-semibold uppercase tracking-widest">
                                Image Gallery
                            </span>
                        </div>
                        <h1 className="font-montserrat font-bold text-3xl md:text-4xl text-white mb-2">
                            Galeri Gambar
                            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-yellow-200">
                                hasil generate kamu
                            </span>
                        </h1>
                        <p className="font-sans text-purple-200 text-sm md:text-base max-w-md">
                            Lihat semua gambar yang pernah kamu buat dengan AI. Cari, filter, dan kelola koleksi kamu.
                        </p>
                    </div>
                    <div className="flex gap-4 md:gap-6">
                        {[
                            { val: meta?.total ?? "—", label: "Total Gambar" },
                            { val: images.filter((i) => i.status === "completed").length, label: "Selesai" },
                        ].map((s) => (
                            <div key={s.label} className="text-center">
                                <p className="font-montserrat font-bold text-2xl text-white">{s.val}</p>
                                <p className="font-sans text-xs text-purple-300">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                    <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari berdasarkan prompt..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-sans text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <LuX className="text-sm" />
                        </button>
                    )}
                </div>

                {/* Filter toggle */}
                <button
                    onClick={() => setShowFilters((v) => !v)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border font-sans text-sm font-medium transition-all ${
                        showFilters || activeFilters > 0
                            ? "bg-violet-50 dark:bg-violet-500/10 border-violet-300 dark:border-violet-600 text-violet-700 dark:text-violet-300"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                >
                    <LuFilter className="text-sm" />
                    Filter
                    {activeFilters > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {activeFilters}
                        </span>
                    )}
                </button>

                {/* Sort order */}
                <button
                    onClick={() => setSortOrder((s) => (s === "desc" ? "asc" : "desc"))}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-sans text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    title={sortOrder === "desc" ? "Terbaru dulu" : "Terlama dulu"}
                >
                    <LuCalendar className="text-sm" />
                    {sortOrder === "desc" ? "Terbaru" : "Terlama"}
                </button>

                {/* Refresh */}
                <button
                    onClick={() => fetchImages({ page: currentPage, silent: true })}
                    disabled={isRefreshing}
                    className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                    title="Refresh"
                >
                    <LuRefreshCw className={`text-sm ${isRefreshing ? "animate-spin" : ""}`} />
                </button>

                {/* Go to generate */}
                <button
                    onClick={() => navigate("/image")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-sans text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-purple-500/25"
                >
                    <LuSparkles className="text-sm" />
                    Generate Baru
                </button>
            </div>

            {/* ── Filter Panel ── */}
            {showFilters && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-montserrat font-semibold text-sm text-slate-700 dark:text-slate-300">
                            Filter
                        </h3>
                        {activeFilters > 0 && (
                            <button
                                onClick={() => {
                                    setStatusFilter("");
                                    setDateFrom("");
                                    setDateTo("");
                                }}
                                className="text-xs font-sans text-rose-500 hover:text-rose-700 transition-colors"
                            >
                                Reset semua
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-xs font-sans text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-sans text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                            >
                                <option value="">Semua Status</option>
                                <option value="completed">Completed</option>
                                <option value="processing">Processing</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Date From */}
                        <div>
                            <label className="block text-xs font-sans text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-sans text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="block text-xs font-sans text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                Sampai Tanggal
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-sans text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Content ── */}
            {isLoading ? (
                // Loading skeleton
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="aspect-square bg-slate-200 dark:bg-slate-800 animate-pulse" />
                            <div className="p-3 space-y-2">
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-full" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                // Error state
                <div className="flex flex-col items-center justify-center min-h-64 text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/20 flex items-center justify-center">
                        <LuCircleAlert className="text-rose-500 text-3xl" />
                    </div>
                    <div>
                        <p className="font-montserrat font-bold text-slate-900 dark:text-slate-100 mb-1">
                            Terjadi Kesalahan
                        </p>
                        <p className="font-sans text-sm text-slate-500 dark:text-slate-400">{error}</p>
                    </div>
                    <button
                        onClick={() => fetchImages({ page: 1 })}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-sans font-medium hover:bg-violet-700 transition-colors"
                    >
                        <LuRefreshCw className="text-sm" />
                        Coba Lagi
                    </button>
                </div>
            ) : images.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center min-h-64 text-center gap-6 py-16">
                    <div className="relative">
                        <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-500/10 dark:to-purple-500/10">
                            <LuImage className="text-purple-500 text-4xl" />
                        </div>
                        <div className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg">
                            <LuSparkles className="text-white text-sm" />
                        </div>
                    </div>
                    <div>
                        <h2 className="font-montserrat font-bold text-xl text-slate-900 dark:text-slate-50 mb-2">
                            {search || statusFilter || dateFrom || dateTo
                                ? "Tidak ada hasil ditemukan"
                                : "Galeri masih kosong"}
                        </h2>
                        <p className="font-sans text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                            {search || statusFilter || dateFrom || dateTo
                                ? "Coba ubah pencarian atau filter kamu."
                                : "Belum ada gambar yang di-generate. Mulai buat gambar pertama kamu!"}
                        </p>
                    </div>
                    {!search && !statusFilter && !dateFrom && !dateTo && (
                        <button
                            onClick={() => navigate("/image")}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-sans text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-purple-500/25"
                        >
                            <LuSparkles className="text-sm" />
                            Generate Gambar Pertama
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Results info */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-sans text-sm text-slate-500 dark:text-slate-400">
                            Menampilkan{" "}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {images.length}
                            </span>{" "}
                            {meta?.total ? `dari ${meta.total}` : ""} gambar
                        </p>
                        {isRefreshing && (
                            <div className="flex items-center gap-1.5 text-violet-500 text-xs font-sans">
                                <LuLoader className="animate-spin text-xs" />
                                Memperbarui...
                            </div>
                        )}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                        {images.map((img) => (
                            <ImageCard
                                key={img.id}
                                image={img}
                                onSelect={setSelectedImage}
                                onDelete={requestDelete}
                                isDeleting={deletingId === img.id}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {meta && meta.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2 pb-8">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <LuChevronLeft className="text-base" />
                            </button>

                            {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                                .filter(
                                    (p) =>
                                        p === 1 ||
                                        p === meta.last_page ||
                                        Math.abs(p - currentPage) <= 2
                                )
                                .reduce((acc, p, i, arr) => {
                                    if (i > 0 && p - arr[i - 1] > 1) {
                                        acc.push("...");
                                    }
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) =>
                                    p === "..." ? (
                                        <span
                                            key={`ellipsis-${i}`}
                                            className="w-9 h-9 flex items-center justify-center text-slate-400 font-sans text-sm"
                                        >
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => goToPage(p)}
                                            className={`w-9 h-9 rounded-xl font-sans text-sm font-medium transition-all ${
                                                p === currentPage
                                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                                                    : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage >= meta.last_page}
                                className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <LuChevronRight className="text-base" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── Lightbox ── */}
            {selectedImage && (
                <Lightbox
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                    onDelete={requestDelete}
                    isDeleting={deletingId === selectedImage.id}
                />
            )}

            {/* ── Delete Confirm Dialog ── */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/30 mx-auto mb-4">
                            <LuTrash2 className="text-rose-500 text-xl" />
                        </div>
                        <h3 className="font-montserrat font-bold text-lg text-slate-900 dark:text-slate-100 text-center mb-2">
                            Hapus Gambar?
                        </h3>
                        <p className="font-sans text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
                            Gambar akan dihapus permanen beserta filenya. Tindakan ini tidak bisa dibatalkan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-sans text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDelete(confirmDeleteId)}
                                disabled={!!deletingId}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-sans text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-60"
                            >
                                {deletingId ? (
                                    <LuLoader className="animate-spin text-sm" />
                                ) : (
                                    <LuTrash2 className="text-sm" />
                                )}
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

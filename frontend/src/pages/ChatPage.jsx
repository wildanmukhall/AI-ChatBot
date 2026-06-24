import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../api/chatApi";
import { LuSend, LuLoader, LuBot, LuUser, LuZap } from "react-icons/lu";
import useQuotaStore from '../stores/quotaStore';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Input, Button } from "@glinui/ui";
import { gooeyToast } from "goey-toast";

export default function ChatPage() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [tempUserMessage, setTempUserMessage] = useState(null);
    const messagesEndRef = useRef(null);

    const { remaining: quotaRemaining, fetchQuota } = useQuotaStore();

    useEffect(() => {
        fetchQuota();
    }, [fetchQuota]);

    const { data: messagesData, isLoading: loadingMessages } = useQuery({
        queryKey: ["chat-messages", sessionId],
        queryFn: async () => {
            const res = await chatApi.getMessages(sessionId, { per_page: 100 });
            return res.data.data;
        },
        enabled: !!sessionId,
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messagesData, tempUserMessage, isSending]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isSending) return;
        let sid = sessionId;
        if (!sid) {
            try {
                const res = await chatApi.createSession({
                    title: message.slice(0, 50),
                });
                sid = res.data.data.id;
                queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
                navigate(`/chat/${sid}`, { replace: true });
            } catch {
                return;
            }
        }
        setIsSending(true);
        const msg = message;
        setMessage("");
        setTempUserMessage({ role: "user", content: msg });
        try {
            await chatApi.sendMessage(sid, { message: msg });
        } catch (err) {
            console.error("Failed to send message:", err);
            gooeyToast.error(err?.response?.data?.message || "Gagal memproses pesan, silakan coba lagi.");
        } finally {
            queryClient.invalidateQueries({
                queryKey: ["chat-messages", String(sid)],
            });
            queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
            setIsSending(false);
            setTempUserMessage(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0A0A09]">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {/*
                 * Inner wrapper: flex-col + min-h-full
                 * flex-1 spacer di atas mendorong messages ke bawah,
                 * mirip WhatsApp / ChatGPT — bubble terbaru selalu di bawah.
                 */}
                <div className="flex flex-col min-h-full">
                    {/* Spacer — mendorong semua konten ke bawah */}
                    <div className="flex-1" />
                    {/* Messages ── space-y-4 di wrapper ini */}
                    <div className="space-y-4">
                        {!sessionId ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-500 shadow-xl shadow-amber-500/20 text-black mb-6 animate-pulse">
                                    <LuBot className="text-4xl" />
                                </div>
                                <h2 className="font-sans font-bold text-2xl text-white mb-3">
                                    Mulai Chat dengan <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">AI</span>
                                </h2>
                                <p className="font-sans text-sm text-neutral-400 max-w-sm">
                                    Ketik pesan di bawah untuk memulai percakapan baru dengan Gemini AI yang super cerdas.
                                </p>
                            </div>
                        ) : loadingMessages ? (
                            <div className="flex items-center justify-center h-full">
                                <LuLoader className="text-2xl text-amber-500 animate-spin" />
                            </div>
                        ) : (
                            <>
                                {messagesData?.map((msg, idx) => (
                                    <div
                                        key={msg.id || idx}
                                        className={`flex gap-3 animate-slide-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {msg.role !== "user" && (
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-neutral-900/80 border border-amber-500/30 flex items-center justify-center shadow-md">
                                                <LuBot className="text-amber-500 text-sm" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-3 font-sans text-sm leading-relaxed ${
                                                msg.role === "user"
                                                    ? "bg-[#161615]/80 border border-amber-500/30 text-white shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                                                    : "bg-neutral-900/40 backdrop-blur-xl border border-white/8 text-neutral-200 shadow-2xl shadow-black/80"
                                            }`}
                                        >
                                            <div
                                                className={`prose prose-sm max-w-none ${
                                                    msg.role === "user"
                                                        ? "prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-li:text-white"
                                                        : "dark:prose-invert prose-p:text-neutral-200 prose-headings:text-white prose-strong:text-white"
                                                }`}
                                            >
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                        {msg.role === "user" && (
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                                                <LuUser className="text-amber-400 text-sm" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {tempUserMessage && (
                                    <div className="flex gap-3 justify-end animate-slide-up">
                                        <div className="max-w-[75%] rounded-2xl px-4 py-3 font-sans text-sm leading-relaxed bg-[#161615]/80 border border-amber-500/30 text-white shadow-[0_0_15px_rgba(245,158,11,0.08)]">
                                            <div className="prose prose-sm prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-li:text-white max-w-none">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                >
                                                    {tempUserMessage.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                                            <LuUser className="text-amber-400 text-sm" />
                                        </div>
                                    </div>
                                )}
                                {isSending && (
                                    <div className="flex gap-3 justify-start animate-slide-up-delayed">
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-neutral-900/80 border border-amber-500/30 flex items-center justify-center shadow-md">
                                            <LuBot className="text-amber-500 text-sm" />
                                        </div>
                                        <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/8 text-neutral-200 rounded-2xl px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <LuLoader className="text-sm text-amber-500 animate-spin" />
                                                <span className="font-sans text-sm text-neutral-400">
                                                    AI sedang berpikir...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>
                    {/* /space-y-4 */}
                </div>
                {/* /flex flex-col min-h-full */}
            </div>
            {/* /overflow-y-auto */}

            {/* Input area */}
            <div className="shrink-0 p-4 border-t border-white/8 bg-[#0A0A09]/60 backdrop-blur-xl z-20">
                <div className="flex items-center justify-between max-w-4xl mx-auto mb-2 px-1">
                    <div className="flex items-center gap-1.5 text-xs font-sans text-neutral-400">
                        <LuZap className="text-amber-500" />
                        <span>{quotaRemaining ?? '...'} kuota gambar tersisa</span>
                    </div>
                </div>
                <form
                    onSubmit={handleSend}
                    className="flex gap-3 max-w-4xl mx-auto"
                >
                    <Input
                        type="text"
                        variant="glass"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ketik pesan kamu..."
                        disabled={isSending}
                        className="flex-1 h-12 px-4 rounded-2xl focus-visible:ring-amber-500/30 focus-visible:border-amber-500/60 transition-all text-white placeholder-neutral-500 bg-none bg-[#161615]/45 border-white/8 backdrop-blur-md"
                    />
                    <Button
                        type="submit"
                        disabled={!message.trim() || isSending}
                        className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-full border-none shadow-md shadow-amber-500/10 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                        {isSending ? (
                            <LuLoader className="text-lg animate-spin" />
                        ) : (
                            <LuSend className="text-lg" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}

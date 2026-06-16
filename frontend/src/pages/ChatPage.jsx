import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../api/chatApi";
import { LuSend, LuLoader, LuBot, LuUser } from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatPage() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [tempUserMessage, setTempUserMessage] = useState(null);
    const messagesEndRef = useRef(null);

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
            queryClient.invalidateQueries({
                queryKey: ["chat-messages", String(sid)],
            });
            queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
        } finally {
            setIsSending(false);
            setTempUserMessage(null);
        }
    };

    return (
        <div className="flex flex-col h-full">
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
                    {/* Messages — space-y-4 di wrapper ini */}
                    <div className="space-y-4">
                        {!sessionId ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-blue-500 to-indigo-500 shadow-xl shadow-indigo-500/25 mb-6">
                                    <LuBot className="text-white text-4xl" />
                                </div>
                                <h2 className="font-montserrat font-bold text-2xl text-slate-900 dark:text-slate-50 mb-3">
                                    Mulai Chat dengan AI
                                </h2>
                                <p className="font-sans text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                                    Ketik pesan di bawah untuk memulai
                                    percakapan baru dengan Gemini AI.
                                </p>
                            </div>
                        ) : loadingMessages ? (
                            <div className="flex items-center justify-center h-full">
                                <LuLoader className="text-2xl text-slate-400 animate-spin" />
                            </div>
                        ) : (
                            <>
                                {messagesData?.map((msg, idx) => (
                                    <div
                                        key={msg.id || idx}
                                        className={`flex gap-3 animate-slide-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {msg.role !== "user" && (
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
                                                <LuBot className="text-white text-sm" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-3 font-sans text-sm leading-relaxed ${msg.role === "user" ? "bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-indigo-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"}`}
                                        >
                                            <div
                                                className={`prose prose-sm max-w-none ${msg.role === "user" ? "prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-li:text-white" : "dark:prose-invert"}`}
                                            >
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                        {msg.role === "user" && (
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                <LuUser className="text-slate-600 dark:text-slate-300 text-sm" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {tempUserMessage && (
                                    <div className="flex gap-3 justify-end animate-slide-up">
                                        <div className="max-w-[75%] rounded-2xl px-4 py-3 font-sans text-sm leading-relaxed bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
                                            <div className="prose prose-sm prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-li:text-white max-w-none">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                >
                                                    {tempUserMessage.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                            <LuUser className="text-slate-600 dark:text-slate-300 text-sm" />
                                        </div>
                                    </div>
                                )}
                                {isSending && (
                                    <div className="flex gap-3 justify-start animate-slide-up-delayed">
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
                                            <LuBot className="text-white text-sm" />
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <LuLoader className="text-sm text-slate-400 animate-spin" />
                                                <span className="font-sans text-sm text-slate-400">
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
            <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <form
                    onSubmit={handleSend}
                    className="flex gap-3 max-w-4xl mx-auto"
                >
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ketik pesan kamu..."
                        disabled={isSending}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-sans text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-60"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || isSending}
                        className="flex items-center justify-center w-12 h-12 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? (
                            <LuLoader className="text-lg animate-spin" />
                        ) : (
                            <LuSend className="text-lg" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

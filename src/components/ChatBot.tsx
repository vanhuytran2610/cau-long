import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { AGENT_URL } from "../helpers/constants";
import { CircleArrowReload01Icon, ChatBotIcon, MaximizeScreenIcon } from "hugeicons-react";
import type { Message, Suggestion } from "../helpers/ChatbotInterface";

const STORAGE_MESSAGES_KEY = "chatbot_messages";
const STORAGE_THREAD_KEY = "chatbot_thread_id";

interface ChatBotProps {
  onRefreshNeeded?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onRefreshNeeded }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_MESSAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_THREAD_KEY),
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  // Persist threadId to localStorage whenever it changes
  useEffect(() => {
    if (threadId) {
      localStorage.setItem(STORAGE_THREAD_KEY, threadId);
    } else {
      localStorage.removeItem(STORAGE_THREAD_KEY);
    }
  }, [threadId]);

  // Clear stored conversation when user logs out
  useEffect(() => {
    if (!token) {
      setMessages([]);
      setThreadId(null);
      localStorage.removeItem(STORAGE_MESSAGES_KEY);
      localStorage.removeItem(STORAGE_THREAD_KEY);
    }
  }, [token]);

  useEffect(() => {
    fetch(`${AGENT_URL}/suggestions`)
      .then((r) => r.json())
      .then((data) => setSuggestions(data.suggestions ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOpen || messages.length > 0 || !token) return;
    setLoading(true);
    fetch(`${AGENT_URL}/welcome`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => setMessages([{ role: "assistant", content: data.reply }]))
      .catch(() =>
        setMessages([
          {
            role: "assistant",
            content: "Xin chào! Tôi có thể giúp gì cho bạn?",
          },
        ]),
      )
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading || !token) return;
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setInput("");
      if (inputRef.current) inputRef.current.style.height = "auto";
      setLoading(true);

      try {
        const res = await fetch(`${AGENT_URL}/agent`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ message: text, thread_id: threadId }),
        });
        const data = await res.json();
        setThreadId(data.thread_id);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
        onRefreshNeeded?.();
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Có lỗi xảy ra. Vui lòng thử lại." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, token, threadId],
  );

  const handleReset = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${AGENT_URL}/agent/reset`, {
        method: "POST",
        headers: authHeaders,
      });
      const data = await res.json();
      setThreadId(data.thread_id);
    } catch {}
    setMessages([]);

    setLoading(true);
    fetch(`${AGENT_URL}/welcome`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => setMessages([{ role: "assistant", content: data.reply }]))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const MAX_TEXTAREA_HEIGHT = 76; // ~3 lines (text-sm line-height 20px × 3 + py-2 16px)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    const next = Math.min(e.target.scrollHeight, MAX_TEXTAREA_HEIGHT);
    e.target.style.height = `${next}px`;
    e.target.style.overflowY = e.target.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-red-400 hover:bg-red-300 active:scale-95 text-black rounded-full shadow-xl flex items-center justify-center text-2xl transition-all"
        title="Chat với AI"
      >
        {isOpen ? "✕" : <ChatBotIcon size={28} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-gray-50 border border-gray-700 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 left-0 right-0 top-0 bottom-24 sm:rounded-2xl ${
            isFullscreen
              ? "sm:inset-4"
              : "sm:left-auto sm:top-auto sm:w-96 sm:h-[520px] sm:bottom-24 sm:right-6"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-red-200 border-b border-gray-700 shrink-0">
            <div className="flex items-center gap-1">
              <ChatBotIcon size={28} color="black" />
              <span className="text-black font-primaryBold text-md">
                Chatbot AI
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={handleReset}
                disabled={loading}
                className="text-black hover:text-gray-700 disabled:opacity-40 transition-colors"
                title="Cuộc trò chuyện mới"
              >
                <CircleArrowReload01Icon size={24} />
              </button>
              <button
                onClick={() => setIsFullscreen((f) => !f)}
                className="hidden sm:block text-black hover:text-gray-700 transition-colors"
                title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
              >
                <MaximizeScreenIcon size={22} />
              </button>
            </div>
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl font-primaryRegular px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    msg.role === "user"
                      ? "bg-red-400 text-black rounded-br-sm"
                      : "bg-gray-300 text-black rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-300 rounded-2xl rounded-bl-sm px-4 py-3">
                  <span className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion chips */}
          {suggestions.length > 0 && (
            <div className="px-3 pb-1 pt-3 flex flex-wrap gap-1.5 shrink-0 border-t border-gray-700">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => sendMessage(s.prompt)}
                  disabled={loading}
                  className="font-primaryMedium text-xs px-2.5 py-1 rounded-full border border-gray-600 text-gray-700 hover:border-red-400 hover:text-red-400 disabled:opacity-40 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="px-3 pb-3 pt-2 border-gray-700 flex gap-2 shrink-0 items-end">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              disabled={loading}
              className="flex-1 bg-gray-300 text-black font-primaryRegular text-sm rounded-xl px-3 py-2 outline-none border border-gray-600 focus:border-gray-600 placeholder-gray-500 disabled:opacity-50 transition-colors resize-none overflow-hidden"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-9 h-9 shrink-0 bg-red-400 hover:bg-red-300 active:scale-95 text-black rounded-xl flex items-center justify-center text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  CircleArrowReload01Icon,
  ChatBotIcon,
  MaximizeScreenIcon,
} from "hugeicons-react";
import {
  fetchSuggestions,
  fetchWelcome,
  sendChatMessage,
  resetConversation,
  addUserMessage,
  clearConversation,
  setIsOpen,
  setIsFullscreen,
} from "../redux/chatbotSlice";
import { useAppDispatch, type RootState } from "../redux/store";
import { useTranslation } from "react-i18next";

interface ChatBotProps {
  onRefreshNeeded?: () => void;
}

const MAX_TEXTAREA_HEIGHT = 76;

const ChatBot: React.FC<ChatBotProps> = ({ onRefreshNeeded }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const language = useSelector((state: RootState) => state.language.language);
  const { messages, loading, suggestions, isOpen, isFullscreen } = useSelector(
    (state: RootState) => state.chatbot,
  );

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    dispatch(fetchSuggestions());
  }, [dispatch, language]);

  useEffect(() => {
    if (!token) dispatch(clearConversation());
  }, [token, dispatch]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && token) {
      dispatch(fetchWelcome());
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading || !token) return;
    dispatch(addUserMessage(text));
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    await dispatch(sendChatMessage(text));
    onRefreshNeeded?.();
  };

  const handleReset = () => {
    if (!token) return;
    dispatch(resetConversation());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    const next = Math.min(e.target.scrollHeight, MAX_TEXTAREA_HEIGHT);
    e.target.style.height = `${next}px`;
    e.target.style.overflowY =
      e.target.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => dispatch(setIsOpen(!isOpen))}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-red-400 hover:bg-red-300 active:scale-95 text-black rounded-full shadow-xl flex items-center justify-center text-2xl transition-all"
        title={t("chatbot.toggleButtonTitle")}
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
                title={t("chatbot.resetConversation")}
              >
                <CircleArrowReload01Icon size={24} />
              </button>
              <button
                onClick={() => dispatch(setIsFullscreen(!isFullscreen))}
                className="hidden sm:block text-black hover:text-gray-700 transition-colors"
                title={
                  isFullscreen ? t("chatbot.minimize") : t("chatbot.maximize")
                }
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
                  onClick={() => handleSend(s.prompt)}
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
              placeholder={t("chatbot.inputPlaceholder") || "Nhập tin nhắn..."}
              disabled={loading}
              className="flex-1 bg-gray-300 text-black font-primaryRegular text-sm rounded-xl px-3 py-2 outline-none border border-gray-600 focus:border-gray-600 placeholder-gray-500 disabled:opacity-50 transition-colors resize-none overflow-hidden"
            />
            <button
              onClick={() => handleSend(input)}
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

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AGENT_URL } from "../helpers/constants";
import type { Message, Suggestion } from "../interface/ChatbotInterface";
import type { RootState } from "./store";
import i18n from "../i18n";

const STORAGE_MESSAGES_KEY = "chatbot_messages";
const STORAGE_THREAD_KEY = "chatbot_thread_id";

interface ChatbotState {
  messages: Message[];
  threadId: string | null;
  loading: boolean;
  suggestions: Suggestion[];
  isOpen: boolean;
  isFullscreen: boolean;
}

const loadMessages = (): Message[] => {
  try {
    const stored = localStorage.getItem(STORAGE_MESSAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const initialState: ChatbotState = {
  messages: loadMessages(),
  threadId: localStorage.getItem(STORAGE_THREAD_KEY),
  loading: false,
  suggestions: [],
  isOpen: false,
  isFullscreen: false,
};

export const fetchSuggestions = createAsyncThunk<Suggestion[], void, { state: RootState }>(
  "chatbot/fetchSuggestions",
  async (_, { getState }) => {
    const language = getState().language.language;
    const response = await fetch(`${AGENT_URL}/suggestions`, {
      headers: { "Accept-Language": language },
    });
    const data = await response.json();
    return data.suggestions ?? [];
  }
);

export const fetchWelcome = createAsyncThunk<string, void, { state: RootState }>(
  "chatbot/fetchWelcome",
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    const language = getState().language.language;
    try {
      const response = await fetch(`${AGENT_URL}/welcome`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept-Language": language,
        },
      });
      const data = await response.json();
      return data.reply;
    } catch {
      return rejectWithValue("failed");
    }
  }
);

export const sendChatMessage = createAsyncThunk<
  { reply: string; thread_id: string },
  string,
  { state: RootState }
>(
  "chatbot/sendMessage",
  async (text, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    const threadId = state.chatbot.threadId;
    const language = state.language.language;
    try {
      const response = await fetch(`${AGENT_URL}/agent`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept-Language": language,
        },
        body: JSON.stringify({ message: text, thread_id: threadId }),
      });
      const data = await response.json();
      return { reply: data.reply, thread_id: data.thread_id };
    } catch {
      return rejectWithValue("failed");
    }
  }
);

export const resetConversation = createAsyncThunk<string, void, { state: RootState }>(
  "chatbot/reset",
  async (_, { getState, dispatch }) => {
    const token = getState().auth.token;
    const response = await fetch(`${AGENT_URL}/agent/reset`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    const data = await response.json();
    await dispatch(fetchWelcome());
    return data.thread_id;
  }
);

const chatbotSlice = createSlice({
  name: "chatbot",
  initialState,
  reducers: {
    setIsOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    },
    setIsFullscreen(state, action: PayloadAction<boolean>) {
      state.isFullscreen = action.payload;
    },
    addUserMessage(state, action: PayloadAction<string>) {
      state.messages.push({ role: "user", content: action.payload });
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(state.messages));
    },
    clearConversation(state) {
      state.messages = [];
      state.threadId = null;
      localStorage.removeItem(STORAGE_MESSAGES_KEY);
      localStorage.removeItem(STORAGE_THREAD_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      .addCase(fetchWelcome.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWelcome.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = [{ role: "assistant", content: action.payload }];
        localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(state.messages));
      })
      .addCase(fetchWelcome.rejected, (state) => {
        state.loading = false;
        state.messages = [{ role: "assistant", content: i18n.t("chatbot.welcomeFallback") }];
        localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(state.messages));
      })
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.threadId = action.payload.thread_id;
        state.messages.push({ role: "assistant", content: action.payload.reply });
        localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(state.messages));
        localStorage.setItem(STORAGE_THREAD_KEY, action.payload.thread_id);
      })
      .addCase(sendChatMessage.rejected, (state) => {
        state.loading = false;
        state.messages.push({ role: "assistant", content: i18n.t("chatbot.errorMessage") });
        localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(state.messages));
      })
      .addCase(resetConversation.pending, (state) => {
        state.messages = [];
        state.threadId = null;
        localStorage.removeItem(STORAGE_MESSAGES_KEY);
        localStorage.removeItem(STORAGE_THREAD_KEY);
      })
      .addCase(resetConversation.fulfilled, (state, action) => {
        state.threadId = action.payload;
        if (action.payload) localStorage.setItem(STORAGE_THREAD_KEY, action.payload);
      });
  },
});

export const { setIsOpen, setIsFullscreen, addUserMessage, clearConversation } =
  chatbotSlice.actions;
export default chatbotSlice.reducer;

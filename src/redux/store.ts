import { configureStore } from "@reduxjs/toolkit";
import authReducer, { setSessionExpired } from "./authSlice";
import userReducer from "./userSlice";
import categoryReducer from "./categorySlice";
import chatbotReducer from "./chatbotSlice";
import languageReducer from "./languageSlice";
import { useDispatch } from "react-redux";
import { setupResponseInterceptors } from "../helpers/axiosInstance";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    category: categoryReducer,
    chatbot: chatbotReducer,
    language: languageReducer,
  },
});

setupResponseInterceptors(
  store.dispatch,
  (expired: boolean) => setSessionExpired(expired)
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

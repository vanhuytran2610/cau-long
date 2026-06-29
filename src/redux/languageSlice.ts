import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import i18n from "../i18n";
import type { Language, LanguageState } from "../interface/LanguageInterface";

const initialState: LanguageState = {
  language: (localStorage.getItem("language") as Language) || "vi",
};

const languageSlice = createSlice({
  name: "language",
  initialState, 
  reducers: {
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
      localStorage.setItem("language", action.payload);
      i18n.changeLanguage(action.payload);  // sync i18next
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;

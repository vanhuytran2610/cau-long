import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import vi from "./locales/vi/translation.json";

i18next.use(initReactI18next).init({
    lng: localStorage.getItem("i18nextLng") || "vi",
    fallbackLng: "vi",
    resources: {
        en: { translation: en },
        vi: { translation: vi },
    },
    interpolation: {
        escapeValue: false,
    },
})

export default i18next;
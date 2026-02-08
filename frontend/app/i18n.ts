import { I18n } from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./en.json";
import hi from "./hi.json";

// ✅ Create i18n instance
const i18n = new I18n({
  en,
  hi,
});

i18n.enableFallback = true;
i18n.locale = "en";

// ✅ Load language from storage
export const loadLanguage = async () => {
  try {
    const savedLang = await AsyncStorage.getItem("APP_LANGUAGE");
    if (savedLang) {
      i18n.locale = savedLang;
    }
  } catch (e) {
    console.log("Failed to load language", e);
  }
};

// ✅ Change language and save it
export const setLanguage = async (lang: "en" | "hi") => {
  try {
    i18n.locale = lang;
    await AsyncStorage.setItem("APP_LANGUAGE", lang);
  } catch (e) {
    console.log("Failed to save language", e);
  }
};

export default i18n;
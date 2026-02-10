import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import ru from './locales/ru.json';
import kk from './locales/kk.json';
import ky from './locales/ky.json';
import tg from './locales/tg.json';
import tr from './locales/tr.json';
import uz from './locales/uz.json';

const LANGUAGE_STORAGE_KEY = '@app_language';

// Initialize i18n synchronously first with default language
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: 'ru', // Default language
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      kk: { translation: kk },
      ky: { translation: ky },
      tg: { translation: tg },
      tr: { translation: tr },
      uz: { translation: uz },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Load saved language asynchronously after init
const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && savedLanguage !== i18n.language) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error('Error loading saved language:', error);
  }
};

// Load saved language in the background
loadSavedLanguage();

export default i18n;

// Helper function to change language
export const changeLanguage = async (language: string) => {
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Available languages
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha' },
];

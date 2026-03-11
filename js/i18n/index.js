/**
 * Internationalization module.
 *
 * Uses i18next with "natural key" pattern: English text serves as the
 * translation key. When the active locale has a translation, it is
 * returned; otherwise the English key string is used as-is (fallback).
 *
 * Default locale: zh-TW (Traditional Chinese, Taiwan).
 * To switch to English, change `lng` below to 'en'.
 */

import i18next from "i18next";
import zhTW from "./locales/zh-TW.js";

/** Read saved language preference, default to zh-TW */
const savedLng = localStorage.getItem("app-lang") || "zh-TW";

i18next.init({
  lng: savedLng,
  fallbackLng: "en",
  keySeparator: false,
  nsSeparator: false,
  resources: {
    "zh-TW": { translation: zhTW },
    // English uses the key itself as the displayed text (no resource needed)
  },
  interpolation: {
    escapeValue: false, // Not needed for non-HTML frameworks
  },
  initImmediate: false, // Synchronous init (resources already loaded)
});

/**
 * Translate a string. Returns the locale translation if available,
 * otherwise falls back to the English key.
 *
 * @param {string} key - English source text (doubles as translation key)
 * @returns {string} Translated string
 */
export const t = (key, opts) => i18next.t(key, opts);

/**
 * Access the underlying i18next instance (for advanced use cases
 * such as changing language at runtime).
 */
export const i18n = i18next;

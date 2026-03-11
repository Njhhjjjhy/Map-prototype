/**
 * Internationalization module.
 *
 * Lightweight passthrough: returns the English key as-is.
 * No external dependencies required.
 */

/**
 * Translate a string. Returns the key unchanged (English-only app).
 *
 * @param {string} key - English source text
 * @param {object} [opts] - Interpolation options (unused)
 * @returns {string}
 */
export const t = (key, _opts) => key;

/**
 * Stub i18n instance for compatibility.
 */
export const i18n = { t, language: "en" };

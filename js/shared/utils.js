/**
 * Shared utility functions used across app, UI, and map modules.
 */

/**
 * Toggle an item in an array (add if missing, remove if present).
 * Mutates the array in place and returns whether the item is now active.
 */
export function toggleArrayItem(array, item) {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
    return false;
  }
  array.push(item);
  return true;
}

/**
 * Cycle an index forward or backward through an array length, wrapping around.
 * @param {number} length - Array length
 * @param {number} current - Current index
 * @param {number} direction - 1 for next, -1 for previous
 * @returns {number} New index
 */
export function cycleIndex(length, current, direction) {
  return (current + direction + length) % length;
}

/**
 * Promise-based delay.
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format a number as compact Japanese yen (e.g. ¥1.2M, ¥3.5B).
 */
export function formatYen(amount) {
  if (!amount) return "\u00a50";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1e12) return sign + "\u00a5" + (abs / 1e12).toFixed(1) + "T";
  if (abs >= 1e9) return sign + "\u00a5" + (abs / 1e9).toFixed(1) + "B";
  if (abs >= 1e6) return sign + "\u00a5" + (abs / 1e6).toFixed(1) + "M";
  return sign + "\u00a5" + abs.toLocaleString();
}

/**
 * Format a number as simple yen with comma separators (e.g. ¥32,600,000).
 */
export function formatYenSimple(num) {
  return "\u00a5" + num.toLocaleString();
}

/**
 * Format a date relative to now (e.g. "2 days ago", "Just now").
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return "Just now";
}

/**
 * Convert a camelCase key to a Title Case label (e.g. "annualRent" -> "Annual rent").
 */
export function formatStatLabel(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

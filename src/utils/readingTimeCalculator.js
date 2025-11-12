const WORDS_PER_MINUTE = 225;

/**
 * Calculates the estimated reading time for a given text.
 * @param {string} text - The text content to calculate the reading time for.
 * @returns {string} A formatted string representing the estimated reading time (e.g., "5 min read").
 */
export function calculateReadingTime(text) {
  if (!text || typeof text !== "string") {
    return "0 min read";
  }

  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / WORDS_PER_MINUTE);

  if (minutes < 1) {
    return "Less than a min read";
  }

  if (minutes === 1) {
    return "1 min read";
  }

  if (minutes < 60) {
    return `${minutes} min read`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} read`;
  }

  return `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} min read`;
}

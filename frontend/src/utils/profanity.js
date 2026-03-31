export const PROFANITY = ["fuck", "shit", "bitch", "ass", "damn"];

export function clean(text) {
  return PROFANITY.reduce(
    (sanitized, word) => sanitized.replace(new RegExp(word, "gi"), "[REDACTED]"),
    text
  );
}

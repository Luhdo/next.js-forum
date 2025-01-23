export const MODERATION_RULES = {
  REPORT_LIMITS: {
    MAX_REPORTS_PER_USER_PER_DAY: 10,
    MAX_REPORTS_PER_CONTENT: 5,
  },

  CONTENT_RULES: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 50000,
    FORBIDDEN_PATTERNS: [
      // Personal Information
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email addresses

      // Malicious Content
      /\b(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+)\.(?:ru|cn|tk|ga)\b/i, // Suspicious domains

      // Spam Patterns
      /\b(?:buy|sell|cheap|discount|offer|price|deal|sale)\b.{0,30}\b(?:www|http)/i,
    ],
  },

  AUTOMATED_ACTIONS: {
    SPAM: "delete_content",
    PERSONAL_INFO: "delete_content",
    ADULT_CONTENT: "flag_for_review",
    HATE_SPEECH: "flag_for_review",
  },

  PRIORITY_WEIGHTS: {
    hate_speech: 10,
    harassment: 9,
    personal_info: 8,
    adult_content: 7,
    misinformation: 6,
    spam: 5,
    copyright: 4,
    other: 3,
  },
};

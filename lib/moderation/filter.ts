import { ContentFilter } from "../db/schema";
import { MODERATION_RULES } from "./rules";

export function filterContent(
  content: string,
  filters: ContentFilter[]
): {
  isAllowed: boolean;
  flags: Array<{ type: string; reason: string }>;
} {
  const flags: Array<{ type: string; reason: string }> = [];

  // Check content length
  if (content.length < MODERATION_RULES.CONTENT_RULES.MIN_LENGTH) {
    flags.push({
      type: "length",
      reason: "Content is too short",
    });
  }

  if (content.length > MODERATION_RULES.CONTENT_RULES.MAX_LENGTH) {
    flags.push({
      type: "length",
      reason: "Content is too long",
    });
  }

  // Check against forbidden patterns
  for (const pattern of MODERATION_RULES.CONTENT_RULES.FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      flags.push({
        type: "pattern",
        reason: "Content contains forbidden pattern",
      });
    }
  }

  // Check against custom filters
  for (const filter of filters) {
    let matches = false;

    if (filter.type === "keyword") {
      matches = content.toLowerCase().includes(filter.pattern.toLowerCase());
    } else if (filter.type === "regex") {
      try {
        const regex = new RegExp(filter.pattern, "i");
        matches = regex.test(content);
      } catch (error) {
        console.error(`Invalid regex pattern: ${filter.pattern}`);
      }
    } else if (filter.type === "domain") {
      const domainRegex = new RegExp(
        `\\b(?:https?:\/\/)?(?:www\\.)?${filter.pattern}\\b`,
        "i"
      );
      matches = domainRegex.test(content);
    }

    if (matches) {
      flags.push({
        type: filter.category,
        reason: `Content matches ${filter.type} filter: ${filter.category}`,
      });

      if (filter.action === "block") {
        return { isAllowed: false, flags };
      }
    }
  }

  // Content is allowed if no blocking flags were found
  return {
    isAllowed: flags.length === 0,
    flags,
  };
}

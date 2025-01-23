export const REPUTATION_POINTS = {
  TOPIC_CREATED: 5,
  POST_CREATED: 2,
  RECEIVED_LIKE: 10,
  RECEIVED_BOOKMARK: 5,
  TOPIC_PINNED: 20,
  POST_ACCEPTED: 15,
  FIRST_POST: 10,
  CONSECUTIVE_DAILY_VISIT: 2,
  PROFILE_COMPLETED: 5,
  REACHED_VIEW_MILESTONE: 15,
  HELPFUL_FLAG: 5,
  ANSWER_ACCEPTED: 25,
} as const;

export const REPUTATION_LEVELS = {
  NEWBIE: { min: 0, label: "Newbie", color: "text-gray-500" },
  CONTRIBUTOR: { min: 50, label: "Contributor", color: "text-blue-500" },
  ACTIVE_MEMBER: { min: 200, label: "Active Member", color: "text-green-500" },
  TRUSTED_USER: { min: 500, label: "Trusted User", color: "text-purple-500" },
  EXPERT: { min: 1000, label: "Expert", color: "text-yellow-500" },
  MODERATOR: { min: 2000, label: "Moderator", color: "text-red-500" },
} as const;

export const REPUTATION_PRIVILEGES = {
  CREATE_TOPIC: 0,
  COMMENT: 0,
  LIKE_POSTS: 10,
  BOOKMARK_POSTS: 20,
  CREATE_TAGS: 100,
  EDIT_OTHERS_POSTS: 500,
  PIN_TOPICS: 1000,
  LOCK_TOPICS: 1500,
  MODERATE_POSTS: 2000,
  GRANT_BADGES: 2500,
} as const;

export const ACHIEVEMENTS = {
  FIRST_POST: {
    id: "first_post",
    title: "First Steps",
    description: "Created your first post",
    icon: "📝",
  },
  POPULAR_TOPIC: {
    id: "popular_topic",
    title: "Trending",
    description: "Created a topic with 1000+ views",
    icon: "🔥",
  },
  HELPFUL_MEMBER: {
    id: "helpful_member",
    title: "Helping Hand",
    description: "Received 10 accepted answers",
    icon: "🤝",
  },
  REPUTATION_MILESTONE: {
    id: "reputation_milestone",
    title: "Rising Star",
    description: "Reached 500 reputation points",
    icon: "⭐",
  },
} as const;

export function getUserLevel(reputation: number) {
  const levels = Object.entries(REPUTATION_LEVELS).reverse();
  const level = levels.find(([_, { min }]) => reputation >= min);
  return level ? level[1] : REPUTATION_LEVELS.NEWBIE;
}

export function hasPrivilege(
  reputation: number,
  privilege: keyof typeof REPUTATION_PRIVILEGES
) {
  return reputation >= REPUTATION_PRIVILEGES[privilege];
}

export function getNextLevel(reputation: number) {
  const levels = Object.entries(REPUTATION_LEVELS);
  const nextLevel = levels.find(([_, { min }]) => min > reputation);
  return nextLevel
    ? {
        label: nextLevel[1].label,
        pointsNeeded: nextLevel[1].min - reputation,
      }
    : null;
}

export function calculateProgress(reputation: number) {
  const currentLevel = getUserLevel(reputation);
  const nextLevel = getNextLevel(reputation);

  if (!nextLevel) return 100;

  const totalPoints = nextLevel.pointsNeeded + (reputation - currentLevel.min);
  const progress = ((reputation - currentLevel.min) / totalPoints) * 100;

  return Math.round(progress);
}

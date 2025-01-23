import { getDb } from "./index";
import { ObjectId } from "mongodb";

export interface SearchFilters {
  type?: "topics" | "posts" | "all";
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  category?: string;
}

export interface SearchResult {
  id: string;
  type: "topic" | "post";
  title?: string;
  content: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  createdAt: Date;
  score: number;
  highlights: {
    title?: string[];
    content?: string[];
  };
  metadata: {
    tags?: string[];
    category?: string;
    topicId?: string;
    topicTitle?: string;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  took: number;
}

export async function search(
  query: string,
  {
    type = "all",
    page = 1,
    limit = 20,
    filters = {},
  }: {
    type?: "topics" | "posts" | "all";
    page?: number;
    limit?: number;
    filters?: SearchFilters;
  }
): Promise<SearchResponse> {
  const startTime = Date.now();
  const db = await getDb();
  const skip = (page - 1) * limit;

  // Build search pipeline
  const searchStage = {
    $search: {
      index: "default",
      compound: {
        should: [
          {
            text: {
              query,
              path: ["title", "content", "description"],
              fuzzy: {
                maxEdits: 1,
                prefixLength: 3,
              },
              score: { boost: { value: 2 } },
            },
          },
          {
            text: {
              query,
              path: "tags",
              score: { boost: { value: 1.5 } },
            },
          },
        ],
        minimumShouldMatch: 1,
      },
      highlight: {
        path: ["title", "content", "description"],
      },
    },
  };

  // Build match conditions
  const matchStage: any = {};
  if (filters.startDate || filters.endDate) {
    matchStage.createdAt = {};
    if (filters.startDate)
      matchStage.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
  }
  if (filters.tags?.length) matchStage.tags = { $in: filters.tags };
  if (filters.category) matchStage.category = filters.category;

  // Execute search for topics
  const topicsPromise =
    type !== "posts"
      ? db
          .collection("topics")
          .aggregate([
            searchStage,
            { $match: matchStage },
            {
              $lookup: {
                from: "users",
                localField: "authorId",
                foreignField: "_id",
                as: "author",
              },
            },
            { $unwind: "$author" },
            {
              $project: {
                _id: 1,
                type: { $literal: "topic" },
                title: 1,
                description: 1,
                author: {
                  id: "$author._id",
                  name: "$author.name",
                  image: "$author.image",
                },
                createdAt: 1,
                score: { $meta: "searchScore" },
                highlights: { $meta: "searchHighlights" },
                metadata: {
                  tags: "$tags",
                  category: "$category",
                },
              },
            },
          ])
          .toArray()
      : Promise.resolve([]);

  // Execute search for posts
  const postsPromise =
    type !== "topics"
      ? db
          .collection("posts")
          .aggregate([
            searchStage,
            { $match: matchStage },
            {
              $lookup: {
                from: "users",
                localField: "authorId",
                foreignField: "_id",
                as: "author",
              },
            },
            {
              $lookup: {
                from: "topics",
                localField: "topicId",
                foreignField: "_id",
                as: "topic",
              },
            },
            { $unwind: "$author" },
            { $unwind: "$topic" },
            {
              $project: {
                _id: 1,
                type: { $literal: "post" },
                content: 1,
                author: {
                  id: "$author._id",
                  name: "$author.name",
                  image: "$author.image",
                },
                createdAt: 1,
                score: { $meta: "searchScore" },
                highlights: { $meta: "searchHighlights" },
                metadata: {
                  topicId: "$topic._id",
                  topicTitle: "$topic.title",
                },
              },
            },
          ])
          .toArray()
      : Promise.resolve([]);

  // Combine and sort results
  const [topics, posts] = await Promise.all([topicsPromise, postsPromise]);
  const allResults = [...topics, ...posts]
    .sort((a, b) => b.score - a.score)
    .slice(skip, skip + limit);

  const total = topics.length + posts.length;
  const took = Date.now() - startTime;

  return {
    results: allResults,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    took,
  };
}

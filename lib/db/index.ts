import { MongoClient, ObjectId } from "mongodb";
import clientPromise from "../mongodb";
import { Topic, Post, User } from "./schema";

export async function getDb() {
  const client = await clientPromise;
  return client.db("forum");
}

export async function getTopics(page = 1, limit = 10) {
  const db = await getDb();
  const skip = (page - 1) * limit;

  const topics = await db
    .collection<Topic>("topics")
    .find({ visibility: "public" })
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db
    .collection<Topic>("topics")
    .countDocuments({ visibility: "public" });

  return { topics, total, pages: Math.ceil(total / limit) };
}

export async function createTopic(data: Partial<Topic>) {
  const db = await getDb();
  const now = new Date();

  const topic: Partial<Topic> = {
    ...data,
    createdAt: now,
    updatedAt: now,
    subscriberIds: [data.authorId],
    isPinned: false,
    isLocked: false,
  };

  const result = await db.collection<Topic>("topics").insertOne(topic as Topic);
  return result;
}

export async function getTopicBySlug(slug: string) {
  const db = await getDb();
  return db.collection<Topic>("topics").findOne({ slug });
}

export async function getPosts(topicId: string, page = 1, limit = 20) {
  const db = await getDb();
  const skip = (page - 1) * limit;

  const posts = await db
    .collection<Post>("posts")
    .find({ topicId: new ObjectId(topicId) })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db
    .collection<Post>("posts")
    .countDocuments({ topicId: new ObjectId(topicId) });

  return { posts, total, pages: Math.ceil(total / limit) };
}

export async function createPost(data: Partial<Post>) {
  const db = await getDb();
  const now = new Date();

  const post: Partial<Post> = {
    ...data,
    reactions: { likes: [], bookmarks: [] },
    isEdited: false,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection<Post>("posts").insertOne(post as Post);
  return result;
}

export async function getUserById(id: string) {
  const db = await getDb();
  return db.collection<User>("users").findOne({ _id: new ObjectId(id) });
}

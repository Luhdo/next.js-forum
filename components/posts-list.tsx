"use client";

import { Post } from "@/lib/db/schema";
import { formatDistanceToNow } from "date-fns";
import { Heart, Bookmark } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

interface PostsListProps {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  topicSlug: string;
}

export default function PostsList({
  posts,
  currentPage,
  totalPages,
  topicSlug,
}: PostsListProps) {
  const { data: session } = useSession();
  const [optimisticPosts, setOptimisticPosts] = useState(posts);

  async function handleReaction(postId: string, type: "like" | "bookmark") {
    if (!session?.user) {
      toast.error("Please sign in to react to posts");
      return;
    }

    try {
      // Optimistic update
      setOptimisticPosts((current) =>
        current.map((post) => {
          if (post._id.toString() === postId) {
            const userId = session.user.id;
            const reactions = { ...post.reactions };
            const key = (type + "s") as "likes" | "bookmarks";
            const hasReacted = reactions[key].includes(userId);

            reactions[key] = hasReacted
              ? reactions[key].filter((id) => id !== userId)
              : [...reactions[key], userId];

            return { ...post, reactions };
          }
          return post;
        })
      );

      const response = await fetch(`/api/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) throw new Error();
    } catch (error) {
      toast.error(`Failed to ${type} post`);
      setOptimisticPosts(posts); // Revert on error
    }
  }

  return (
    <div className="space-y-4">
      {optimisticPosts.map((post) => (
        <Card key={post._id.toString()} className="p-6">
          <div className="space-y-4">
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
                {post.isEdited && " (edited)"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleReaction(post._id.toString(), "like")}
                  data-active={
                    session?.user &&
                    post.reactions.likes.includes(session.user.id)
                  }
                >
                  <Heart
                    className={`h-4 w-4 ${
                      session?.user &&
                      post.reactions.likes.includes(session.user.id)
                        ? "fill-current"
                        : ""
                    }`}
                  />
                  {post.reactions.likes.length}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    handleReaction(post._id.toString(), "bookmark")
                  }
                  data-active={
                    session?.user &&
                    post.reactions.bookmarks.includes(session.user.id)
                  }
                >
                  <Bookmark
                    className={`h-4 w-4 ${
                      session?.user &&
                      post.reactions.bookmarks.includes(session.user.id)
                        ? "fill-current"
                        : ""
                    }`}
                  />
                  {post.reactions.bookmarks.length}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious
                href={`/topics/${topicSlug}?page=${currentPage - 1}`}
              />
            </PaginationItem>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href={`/topics/${topicSlug}?page=${page}`}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext
                href={`/topics/${topicSlug}?page=${currentPage + 1}`}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import RichTextEditor from "./rich-text-editor";
import { toast } from "sonner";

interface NewPostFormProps {
  topicId: string;
}

export default function NewPostForm({ topicId }: NewPostFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          topicId,
          authorId: session.user.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      setContent("");
      toast.success("Post created successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <RichTextEditor content={content} onChange={setContent} />
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? "Posting..." : "Post Reply"}
        </Button>
      </form>
    </Card>
  );
}

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTopicBySlug, getPosts } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pin, Lock, MessageSquare } from "lucide-react";
import PostsList from "@/components/posts-list";
import NewPostForm from "@/components/new-post-form";

interface TopicPageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

export default async function TopicPage({
  params,
  searchParams,
}: TopicPageProps) {
  const topic = await getTopicBySlug(params.slug);
  if (!topic) notFound();

  const page = Number(searchParams.page) || 1;
  const { posts, total, pages } = await getPosts(topic._id.toString(), page);

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{topic.title}</h1>
              {topic.isPinned && (
                <Pin className="h-5 w-5 text-muted-foreground" />
              )}
              {topic.isLocked && (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <p className="text-muted-foreground mb-4">{topic.description}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{topic.category}</Badge>
              {topic.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Subscribe
          </Button>
        </div>
      </Card>

      <div className="space-y-6">
        <Suspense fallback={<div>Loading posts...</div>}>
          <PostsList
            posts={posts}
            currentPage={page}
            totalPages={pages}
            topicSlug={params.slug}
          />
        </Suspense>

        {!topic.isLocked && <NewPostForm topicId={topic._id.toString()} />}
      </div>
    </div>
  );
}

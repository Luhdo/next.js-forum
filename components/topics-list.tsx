"use client";

import { Topic } from "@/lib/db/schema";
import { formatDistanceToNow } from "date-fns";
import { Pin, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { useEffect, useState } from "react";

interface TopicsListProps {
  currentPage: number;
  totalPages: number;
  topics: Topic[];
}

export default function TopicsList({
  currentPage,
  totalPages,
}: TopicsListProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const response = await fetch(`/api/topics?page=${currentPage}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setTopics(data.topics);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchTopics();
  }, [currentPage]);

  if (loading) return <div>Loading topics...</div>;
  if (error) return <div>Failed to load topics</div>;

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <Card key={topic._id.toString()} className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/topics/${topic.slug}`}
                  className="text-xl font-semibold hover:underline"
                >
                  {topic.title}
                </Link>
                {topic.isPinned && (
                  <Pin className="h-4 w-4 text-muted-foreground" />
                )}
                {topic.isLocked && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-muted-foreground mt-1">{topic.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{topic.category}</Badge>
                {topic.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(topic.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        </Card>
      ))}

      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious href={`/?page=${currentPage - 1}`} />
            </PaginationItem>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href={`/?page=${page}`}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext href={`/?page=${currentPage + 1}`} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}

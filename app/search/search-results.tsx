"use client";

import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { SearchResponse, SearchResult } from "@/lib/db/search";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, FileText } from "lucide-react";
import Link from "next/link";

interface SearchResultsProps {
  results: SearchResponse;
}

export default function SearchResults({
  results: initialResults,
}: SearchResultsProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["search", query, searchParams.toString()],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            page: pageParam,
            type: searchParams.get("type") || "all",
            filters: {
              category: searchParams.get("category"),
              tags: searchParams.get("tags")?.split(","),
              startDate: searchParams.get("startDate"),
              endDate: searchParams.get("endDate"),
            },
          }),
        });
        return response.json();
      },
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
      initialData: { pages: [initialResults], pageParams: [1] },
    });

  const allResults = data.pages.flatMap((page) => page.results);

  return (
    <div className="space-y-4">
      {allResults.map((result: SearchResult) => (
        <Card key={result.id} className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {result.type === "topic" ? (
                <MessageSquare className="h-6 w-6 text-primary" />
              ) : (
                <FileText className="h-6 w-6 text-primary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={
                    result.type === "topic"
                      ? `/topics/${result.id}`
                      : `/topics/${result.metadata.topicId}#post-${result.id}`
                  }
                  className="text-lg font-semibold hover:underline truncate"
                >
                  {result.type === "topic"
                    ? result.title
                    : result.metadata.topicTitle}
                </Link>
                <Badge variant="secondary">{result.type}</Badge>
              </div>

              <div
                className="text-sm text-muted-foreground mb-2 line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html: result.highlights.content?.[0] || result.content,
                }}
              />

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={result.author.image} />
                    <AvatarFallback>
                      {result.author.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{result.author.name}</span>
                </div>

                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(result.createdAt), {
                    addSuffix: true,
                  })}
                </span>

                {result.type === "topic" && result.metadata.tags && (
                  <div className="flex items-center gap-1">
                    {result.metadata.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {hasNextPage && (
        <div ref={ref} className="py-4 text-center">
          {isFetchingNextPage ? (
            <div>Loading more results...</div>
          ) : (
            <div>Load more</div>
          )}
        </div>
      )}
    </div>
  );
}

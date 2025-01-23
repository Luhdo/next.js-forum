import { Suspense } from "react";
import { search, SearchFilters } from "@/lib/db/search";
import SearchResults from "./search-results";
import SearchFiltersPanel from "./search-filters";
import { Card } from "@/components/ui/card";

interface SearchPageProps {
  searchParams: {
    q?: string;
    type?: "topics" | "posts" | "all";
    page?: string;
    category?: string;
    tags?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  const page = Number(searchParams.page) || 1;
  const type = (searchParams.type || "all") as "topics" | "posts" | "all";

  const filters: SearchFilters = {
    type,
    category: searchParams.category,
    tags: searchParams.tags?.split(","),
    startDate: searchParams.startDate
      ? new Date(searchParams.startDate)
      : undefined,
    endDate: searchParams.endDate ? new Date(searchParams.endDate) : undefined,
  };

  const results = await search(query, { type, page, filters });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Search Results for "{query}"</h1>
      <p className="text-muted-foreground mb-6">
        Found {results.total} results ({results.took}ms)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 md:col-span-1">
          <SearchFiltersPanel
            currentFilters={filters}
            totalResults={results.total}
          />
        </Card>

        <div className="md:col-span-3">
          <Suspense fallback={<div>Loading results...</div>}>
            <SearchResults results={results} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

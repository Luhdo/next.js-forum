"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchResult } from "@/lib/db/search";

export default function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(searchResults, 300);

  async function searchResults(query: string) {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          type: "all",
          limit: 5,
        }),
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearch = useCallback(
    (query: string) => {
      setQuery(query);
      debouncedSearch(query);
    },
    [debouncedSearch]
  );

  function handleSelect(result: SearchResult) {
    setOpen(false);
    if (result.type === "topic") {
      router.push(`/topics/${result.metadata.topicId}`);
    } else {
      router.push(`/topics/${result.metadata.topicId}#post-${result.id}`);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.length >= 3) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full max-w-sm items-center"
      >
        <Button
          type="button"
          variant="ghost"
          className="absolute left-2"
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="h-4 w-4" />
        </Button>
        <Input
          type="search"
          placeholder="Search topics and posts..."
          className="pl-10"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setOpen(true)}
        />
      </form>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search topics and posts..."
          value={query}
          onValueChange={handleSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {isLoading ? (
            <div className="py-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : (
            results.map((result) => (
              <CommandGroup
                key={result.id}
                heading={result.type === "topic" ? "Topics" : "Posts"}
              >
                <CommandItem
                  value={result.id}
                  onSelect={() => handleSelect(result)}
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">
                      {result.type === "topic"
                        ? result.title
                        : result.metadata.topicTitle}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {result.content}
                    </div>
                  </div>
                </CommandItem>
              </CommandGroup>
            ))
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

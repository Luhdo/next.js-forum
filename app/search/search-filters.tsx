"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { SearchFilters } from "@/lib/db/search";

interface SearchFiltersPanelProps {
  currentFilters: SearchFilters;
  totalResults: number;
}

export default function SearchFiltersPanel({
  currentFilters,
  totalResults,
}: SearchFiltersPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [startDate, setStartDate] = useState<Date | undefined>(
    currentFilters.startDate
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    currentFilters.endDate
  );

  function updateFilters(updates: Partial<SearchFilters>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else if (value instanceof Date) {
        params.set(key, value.toISOString());
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`/search?${params.toString()}`);
  }

  function clearFilters() {
    router.push(`/search?q=${searchParams.get("q")}`);
  }

  const hasActiveFilters =
    currentFilters.type !== "all" ||
    currentFilters.category ||
    currentFilters.tags?.length ||
    currentFilters.startDate ||
    currentFilters.endDate;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Content Type</label>
          <Select
            value={currentFilters.type || "all"}
            onValueChange={(value) =>
              updateFilters({ type: value as SearchFilters["type"] })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="topics">Topics Only</SelectItem>
              <SelectItem value="posts">Posts Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Date Range</label>
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP")
                  ) : (
                    <span>Start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    updateFilters({ startDate: date });
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>End date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    updateFilters({ endDate: date });
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {currentFilters.tags && currentFilters.tags.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Active Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {currentFilters.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() =>
                    updateFilters({
                      tags: currentFilters.tags?.filter((t) => t !== tag),
                    })
                  }
                >
                  {tag}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          {totalResults} results found
        </p>
      </div>
    </div>
  );
}

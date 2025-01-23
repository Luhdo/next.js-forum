import { NextResponse } from "next/server";
import { search, SearchFilters } from "@/lib/db/search";
import { z } from "zod";

const searchParamsSchema = z.object({
  query: z.string().min(3),
  type: z.enum(["topics", "posts", "all"]).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  filters: z
    .object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      tags: z.array(z.string()).optional(),
      category: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const params = searchParamsSchema.parse(body);

    const results = await search(params.query, {
      type: params.type,
      page: params.page,
      limit: params.limit,
      filters: params.filters as SearchFilters,
    });

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}

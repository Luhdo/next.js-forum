import { Suspense } from "react";
import TopicsList from "@/components/topics-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function Home({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Topics</h1>
          <p className="text-muted-foreground">Join the discussion</p>
        </div>
        <Button asChild>
          <Link href="/topics/new">
            <Plus className="mr-2 h-4 w-4" />
            New Topic
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading topics...</div>}>
        <TopicsList currentPage={page} totalPages={1} topics={[]} />
      </Suspense>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function ModerationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "pending",
    priority: "",
  });

  useEffect(() => {
    if (
      session?.user?.role !== "admin" &&
      session?.user?.role !== "moderator"
    ) {
      router.push("/");
      return;
    }

    fetchReports();
  }, [session, filters]);

  async function fetchReports() {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.priority) params.set("priority", filters.priority);

      const response = await fetch(`/api/moderation/reports?${params}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  }

  async function handleModeration(action: string) {
    if (!selectedReport) return;

    try {
      const response = await fetch(
        `/api/moderation/reports/${selectedReport._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      if (!response.ok) throw new Error();

      toast.success("Moderation action completed");
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      toast.error("Failed to moderate content");
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation</CardTitle>
          <CardDescription>
            Review and moderate reported content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report._id}>
                  <TableCell>
                    <Badge>{report.contentType}</Badge>
                  </TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.priority === "urgent"
                          ? "destructive"
                          : report.priority === "high"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {report.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.status}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(report.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!selectedReport}
        onOpenChange={() => setSelectedReport(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review Report</AlertDialogTitle>
            <AlertDialogDescription>
              Choose an action for this reported content
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Report Details</h4>
              <p className="text-sm text-muted-foreground">
                {selectedReport?.description}
              </p>
            </div>

            {selectedReport?.evidence && (
              <div>
                <h4 className="font-medium">Evidence</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedReport.evidence}
                </p>
              </div>
            )}
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => handleModeration("no_action")}
            >
              No Action
            </Button>
            <Button
              variant="outline"
              onClick={() => handleModeration("warn_user")}
            >
              Warn User
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleModeration("delete_content")}
            >
              Delete Content
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

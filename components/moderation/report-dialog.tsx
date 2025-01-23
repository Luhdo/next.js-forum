"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";
import { toast } from "sonner";

const reportSchema = z.object({
  reason: z.enum([
    "hate_speech",
    "harassment",
    "spam",
    "adult_content",
    "misinformation",
    "personal_info",
    "copyright",
    "other",
  ]),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters",
  }),
  evidence: z.string().optional(),
});

type ReportForm = z.infer<typeof reportSchema>;

interface ReportDialogProps {
  contentId: string;
  contentType: "topic" | "post";
}

export default function ReportDialog({
  contentId,
  contentType,
}: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: "other",
      description: "",
      evidence: "",
    },
  });

  async function onSubmit(data: ReportForm) {
    try {
      const response = await fetch("/api/moderation/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          contentType,
          ...data,
        }),
      });

      if (!response.ok) throw new Error();

      toast.success("Content reported successfully");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to report content");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag className="h-4 w-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Help us maintain a safe community by reporting inappropriate
            content.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Report</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hate_speech">Hate Speech</SelectItem>
                      <SelectItem value="harassment">Harassment</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="adult_content">
                        Adult Content
                      </SelectItem>
                      <SelectItem value="misinformation">
                        Misinformation
                      </SelectItem>
                      <SelectItem value="personal_info">
                        Personal Information
                      </SelectItem>
                      <SelectItem value="copyright">
                        Copyright Violation
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide details about why you're reporting this content..."
                      className="h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Evidence (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide any additional context or evidence..."
                      className="h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit Report</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

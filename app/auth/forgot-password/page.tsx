"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error();
      setSubmitted(true);
    } catch (error) {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-lg mx-auto py-12">
      <Card className="p-6">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/auth/signin")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Button>

        {submitted ? (
          <div className="text-center">
            <Mail className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-2xl font-bold mt-4">Check your email</h1>
            <p className="text-muted-foreground mt-2">
              If an account exists with {email}, we've sent instructions to
              reset your password.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Forgot your password?</h1>
            <p className="text-muted-foreground mt-2">
              Enter your email address and we'll send you instructions to reset
              your password.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reset Instructions"}
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}

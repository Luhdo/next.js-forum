"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token is invalid or has expired.",
    Default: "An error occurred during authentication.",
  };

  const message = errorMessages[error || "Default"];

  return (
    <div className="container max-w-lg mx-auto py-12">
      <Card className="p-6 text-center">
        <XCircle className="h-12 w-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold mt-4">Authentication Error</h1>
        <p className="text-muted-foreground mt-2">{message}</p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/auth/signin">Try Again</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    async function verifyEmail() {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) throw new Error();
        setStatus("success");
      } catch (error) {
        setStatus("error");
      }
    }

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="container max-w-lg mx-auto py-12">
      <Card className="p-6 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h1 className="text-2xl font-bold mt-4">Verifying your email...</h1>
            <p className="text-muted-foreground mt-2">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold mt-4">Email verified!</h1>
            <p className="text-muted-foreground mt-2">
              Your email has been successfully verified.
            </p>
            <Button className="mt-4" onClick={() => router.push("/")}>
              Continue to Homepage
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
            <h1 className="text-2xl font-bold mt-4">Verification failed</h1>
            <p className="text-muted-foreground mt-2">
              The verification link is invalid or has expired.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/auth/signin")}
            >
              Back to Sign In
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

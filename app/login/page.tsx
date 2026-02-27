"use client";

import { signIn } from "next-auth/react";
import { Chrome } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md rounded-2xl border shadow-lg shadow-black/5">
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl">Textbooked Admin</CardTitle>
          <CardDescription>
            Sign in with your Google account to access the admin workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button
            size="lg"
            className="h-12 w-full rounded-xl"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <Chrome className="size-4" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

import { AlertTriangle } from "lucide-react";

import { ForbiddenAutoSignOut } from "@/components/auth/forbidden-auto-signout";
import { ForbiddenLoginButton } from "@/components/auth/forbidden-login-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <ForbiddenAutoSignOut />
      <Card className="w-full max-w-lg rounded-2xl border shadow-lg shadow-black/5">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-3">
            <div className="inline-flex size-10 items-center justify-center rounded-xl border bg-muted">
              <AlertTriangle className="size-5" />
            </div>
            <CardTitle className="text-2xl">Access forbidden</CardTitle>
          </div>
          <CardDescription>
            Your account is not authorized for the Textbooked admin dashboard. Contact{" "}
            <a className="font-medium underline" href="mailto:support@textbooked.org">
              support@textbooked.org
            </a>{" "}
            for access.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-end pt-6">
          <ForbiddenLoginButton />
        </CardContent>
      </Card>
    </main>
  );
}

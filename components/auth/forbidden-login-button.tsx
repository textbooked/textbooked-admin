"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function ForbiddenLoginButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() =>
        void signOut({ callbackUrl: "/login" }).catch(() => {
          router.replace("/login");
        })
      }
    >
      Back to login
    </Button>
  );
}

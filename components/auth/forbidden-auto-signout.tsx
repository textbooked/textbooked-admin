"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export function ForbiddenAutoSignOut() {
  const { status } = useSession();
  const hasRequestedSignOut = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || hasRequestedSignOut.current) {
      return;
    }

    hasRequestedSignOut.current = true;
    void signOut({ redirect: false });
  }, [status]);

  return null;
}

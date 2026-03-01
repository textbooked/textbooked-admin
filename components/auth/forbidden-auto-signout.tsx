"use client";

import { signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

export function ForbiddenAutoSignOut() {
  const hasRequestedSignOut = useRef(false);

  useEffect(() => {
    if (hasRequestedSignOut.current) {
      return;
    }

    hasRequestedSignOut.current = true;
    void signOut({ redirect: false });
  }, []);

  return null;
}

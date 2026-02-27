"use client";

import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useLayoutEffect } from "react";

import { appendAccessToken, removeHeader } from "@/lib/api/axios";
import { useAdminAuthGetMe } from "@/lib/api/generated/admin-client";
import type { AdminAuthGetMeQueryResult } from "@/lib/api/generated/admin-client";

export function AdminBackendTokenSync() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.apiToken;

  useLayoutEffect(() => {
    if (token) {
      appendAccessToken(token);
      return;
    }

    removeHeader("Authorization");
  }, [token]);

  const { error } = useAdminAuthGetMe<AdminAuthGetMeQueryResult, AxiosError>({
    query: {
      enabled: Boolean(token),
      retry: false,
      refetchOnWindowFocus: false,
    },
    request: token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
  });

  useEffect(() => {
    if (!error) {
      return;
    }

    const status = error.response?.status;
    if (status === 401 || status === 403) {
      void signOut({ callbackUrl: "/login" }).catch(() => {
        router.replace("/login");
      });
    }
  }, [error, router]);

  return null;
}

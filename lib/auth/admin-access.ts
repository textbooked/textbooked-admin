import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth/session";

const ADMIN_ME_PATH = "/admin/auth/me";

export async function requireBackendAdminAccess() {
  const session = await getAuthSession();
  if (!session?.apiToken) {
    redirect("/login");
  }

  try {
    const response = await fetch(`${resolveBackendBaseUrl()}${ADMIN_ME_PATH}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session.apiToken}`,
      },
    });

    if (response.status === 401) {
      redirect("/login");
    }

    if (response.status === 403) {
      redirect("/forbidden");
    }

    if (!response.ok) {
      redirect("/forbidden");
    }
  } catch {
    redirect("/forbidden");
  }

  return session;
}

function resolveBackendBaseUrl(): string {
  const candidates = [
    process.env.BACKEND_INTERNAL_URL,
    process.env.ORVAL_BACKEND_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const normalized = candidate.trim();
    if (normalized.length > 0) {
      return normalized.replace(/\/$/, "");
    }
  }

  throw new Error(
    "Missing backend URL. Set BACKEND_INTERNAL_URL, ORVAL_BACKEND_URL, or NEXT_PUBLIC_BACKEND_URL.",
  );
}

import type { Session } from "next-auth";

export function getAdminAllowlist(raw = process.env.ADMIN_EMAILS): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }

  return getAdminAllowlist().has(email.trim().toLowerCase());
}

export function isAllowlistedSession(
  session: Session | null | undefined,
): boolean {
  return isAdminEmail(session?.user?.email ?? null);
}

import { redirect } from "next/navigation";

import { Header } from "@/components/app-shell/header";
import { Sidebar } from "@/components/app-shell/sidebar";
import { AdminBackendTokenSync } from "@/components/auth/admin-backend-token-sync";
import { isAllowlistedSession } from "@/lib/admin/guard";
import { getAuthSession } from "@/lib/auth/session";

import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  if (!isAllowlistedSession(session)) {
    redirect("/forbidden");
  }

  return (
    <div className="min-h-screen">
      <AdminBackendTokenSync />
      <Header />
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-4 py-4 md:flex-row md:gap-6 md:px-6 md:py-6">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

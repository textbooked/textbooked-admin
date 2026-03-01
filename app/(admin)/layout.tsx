import { Header } from "@/components/app-shell/header";
import { Sidebar } from "@/components/app-shell/sidebar";
import { AdminBackendTokenSync } from "@/components/auth/admin-backend-token-sync";
import { requireBackendAdminAccess } from "@/lib/auth/admin-access";

import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireBackendAdminAccess();

  return (
    <div className="min-h-screen">
      <AdminBackendTokenSync token={session.apiToken} />
      <Header user={session.user} />
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-4 py-4 md:flex-row md:gap-6 md:px-6 md:py-6">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

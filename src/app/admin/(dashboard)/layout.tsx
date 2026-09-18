import { redirect } from "next/navigation";
import { getCurrentOperator } from "@/lib/operators/get-current-operator";
import { countUnreadConsultingRequests } from "@/lib/consulting/get-consulting-requests";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { NotificationBell } from "@/components/admin/NotificationBell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const operator = await getCurrentOperator();

  if (!operator) {
    redirect("/admin/login");
  }

  const unreadCount = await countUnreadConsultingRequests();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col gap-6 bg-slate-900 px-4 py-6 text-white">
        <div className="flex flex-col gap-0.5 px-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            PBA ADMIN
          </p>
          <p className="text-sm font-medium">{operator.email}</p>
        </div>
        <AdminNav isOwner={operator.role === "owner"} />
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end gap-2.5 border-b border-slate-200 px-10 py-3.5">
          <NotificationBell unreadCount={unreadCount} />
          <LogoutButton />
        </header>
        <main className="flex-1 px-10 py-8">{children}</main>
      </div>
    </div>
  );
}

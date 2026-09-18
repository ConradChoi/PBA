import { redirect } from "next/navigation";
import { getCurrentOperator } from "@/lib/operators/get-current-operator";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export default async function AccountPage() {
  const operator = await getCurrentOperator();

  if (!operator) {
    redirect("/admin/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">내 계정</h1>
        <p className="mt-1 text-sm text-slate-500">
          {operator.email} · {operator.role}
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}

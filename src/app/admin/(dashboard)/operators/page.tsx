import { redirect } from "next/navigation";
import { getCurrentOperator } from "@/lib/operators/get-current-operator";
import { listOperators } from "@/lib/operators/list-operators";
import { OperatorsTable } from "@/components/admin/OperatorsTable";

export default async function OperatorsPage() {
  const operator = await getCurrentOperator();

  if (!operator || operator.role !== "owner") {
    redirect("/admin/consulting-requests");
  }

  const operators = await listOperators();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">운영자 관리</h1>
        <p className="mt-1 text-sm text-slate-500">
          owner만 볼 수 있는 화면입니다. 운영자를 추가하거나 삭제할 수 있습니다.
        </p>
      </div>
      <OperatorsTable initialOperators={operators} currentOperatorId={operator.id} />
    </div>
  );
}

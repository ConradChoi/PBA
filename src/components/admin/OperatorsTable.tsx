"use client";

import { useState } from "react";
import type { OperatorListItem } from "@/lib/operators/list-operators";
import type { OperatorRole } from "@/lib/operators/operator-role";
import { ConfirmDialog } from "./ConfirmDialog";

export function OperatorsTable({
  initialOperators,
  currentOperatorId,
}: {
  initialOperators: OperatorListItem[];
  currentOperatorId: string;
}) {
  const [operators, setOperators] = useState(initialOperators);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<OperatorRole>("staff");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<OperatorListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/admin/operators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const json = await response.json();

    if (!response.ok) {
      setError(typeof json.error === "string" ? json.error : "운영자를 추가하지 못했습니다.");
      setSubmitting(false);
      return;
    }

    setOperators((prev) => [
      ...prev,
      { id: json.id, email, role, created_at: new Date().toISOString() },
    ]);
    setEmail("");
    setPassword("");
    setRole("staff");
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    setError(null);
    setDeleting(true);
    const response = await fetch(`/api/admin/operators/${id}`, { method: "DELETE" });
    const json = await response.json();
    setDeleting(false);
    setPendingDelete(null);

    if (!response.ok) {
      setError(typeof json.error === "string" ? json.error : "운영자를 삭제하지 못했습니다.");
      return;
    }

    setOperators((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5"
      >
        <p className="text-sm font-semibold">운영자 추가</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
            이메일
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="new-staff@ylia.io"
              className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
            임시 비밀번호
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="임시 비밀번호 입력"
              className="w-52 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
            역할
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as OperatorRole)}
              className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="staff">staff</option>
              <option value="owner">owner</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={!email || !password || submitting}
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            추가
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3.5">이메일</th>
              <th className="px-4 py-3.5">역할</th>
              <th className="px-4 py-3.5">가입일</th>
              <th className="px-4 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {operators.map((o) => (
              <tr key={o.id} className="border-t border-slate-200">
                <td className="px-4 py-3.5">{o.email}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      o.role === "owner" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {o.role}
                  </span>
                </td>
                <td className="px-4 py-3.5">{new Date(o.created_at).toLocaleDateString("ko-KR")}</td>
                <td className="px-4 py-3.5 text-right">
                  {o.id !== currentOperatorId && (
                    <button
                      type="button"
                      onClick={() => setPendingDelete(o)}
                      className="font-semibold text-red-600"
                    >
                      삭제
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="운영자 삭제"
        message={
          <>
            <span className="font-semibold text-slate-900">{pendingDelete?.email}</span> 계정을
            삭제할까요? 삭제하면 이 계정으로 더 이상 로그인할 수 없습니다.
          </>
        }
        confirmLabel="삭제"
        busy={deleting}
        onConfirm={() => pendingDelete && handleDelete(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);

    if (newPassword.length < 8) {
      setError("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 서로 일치하지 않습니다.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("새 비밀번호가 현재 비밀번호와 같습니다.");
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/admin/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(typeof json.error === "string" ? json.error : "비밀번호를 변경하지 못했습니다.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setDone(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-sm flex-col gap-4 rounded-xl border border-slate-200 p-6"
    >
      <p className="text-sm font-semibold">비밀번호 변경</p>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-slate-700">현재 비밀번호</span>
        <input
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="rounded-lg border border-slate-200 px-3.5 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-slate-700">새 비밀번호 (8자 이상)</span>
        <input
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="rounded-lg border border-slate-200 px-3.5 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-slate-700">새 비밀번호 확인</span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="rounded-lg border border-slate-200 px-3.5 py-2.5"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && <p className="text-sm text-emerald-600">비밀번호가 변경되었습니다.</p>}
      <button
        type="submit"
        disabled={!currentPassword || !newPassword || !confirmPassword || submitting}
        className="rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white disabled:opacity-40"
      >
        {submitting ? "변경하는 중..." : "비밀번호 변경"}
      </button>
    </form>
  );
}

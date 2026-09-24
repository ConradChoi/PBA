"use client";

import { useRouter } from "next/navigation";
import { ChipGroup } from "@/components/ui/ChipGroup";
import type { AccessLogRange } from "@/lib/access-logs/list-access-logs";
import type { AccessLogOutcome } from "@/lib/access-logs/build-access-log-entry";

// The filters live in the URL rather than in component state, because the
// database does the filtering: a month of this table is far more rows than a
// screen can hold, so narrowing has to happen before the row cap, not after.
// A filtered view is also a link the owner can keep in the inspection record.
//
// Current values arrive as props from the page instead of through
// useSearchParams(), so this component needs no Suspense boundary and always
// renders the same values the rows were fetched with.
export type AccessLogFilterValues = {
  range: AccessLogRange;
  outcome: AccessLogOutcome | "all";
  account: string;
  subjectOnly: boolean;
};

const RANGE_OPTIONS: { value: AccessLogRange; label: string }[] = [
  { value: "7d", label: "최근 7일" },
  { value: "30d", label: "최근 30일" },
  { value: "90d", label: "최근 90일" },
  { value: "13m", label: "전체(13개월)" },
];

const OUTCOME_OPTIONS: { value: AccessLogOutcome | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "granted", label: "허용" },
  { value: "denied", label: "차단" },
  { value: "forbidden", label: "권한없음" },
];

const SUBJECT_OPTIONS: { value: "all" | "subject"; label: string }[] = [
  { value: "all", label: "전체 요청" },
  { value: "subject", label: "고객 자료 열람만" },
];

export function AccessLogsFilters({
  values,
  accounts,
}: {
  values: AccessLogFilterValues;
  accounts: string[];
}) {
  const router = useRouter();

  function go(next: Partial<AccessLogFilterValues>) {
    const merged = { ...values, ...next };
    const params = new URLSearchParams({
      range: merged.range,
      outcome: merged.outcome,
      account: merged.account,
      subjects: merged.subjectOnly ? "subject" : "all",
    });

    // replace, not push: stepping back through a dozen filter combinations is
    // not what the browser's back button is for here.
    router.replace(`/admin/access-logs?${params.toString()}`, { scroll: false });
  }

  const accountOptions = [
    { value: "all", label: "전체 계정" },
    ...accounts.map((email) => ({ value: email, label: email })),
  ];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <ChipGroup
        name="accessLogRange"
        label="기간"
        options={RANGE_OPTIONS}
        value={values.range}
        onChange={(range) => go({ range })}
        size="sm"
      />
      <ChipGroup
        name="accessLogOutcome"
        label="결과"
        options={OUTCOME_OPTIONS}
        value={values.outcome}
        onChange={(outcome) => go({ outcome })}
        size="sm"
      />
      <ChipGroup
        name="accessLogAccount"
        label="계정"
        options={accountOptions}
        value={values.account}
        onChange={(account) => go({ account })}
        size="sm"
      />
      <ChipGroup
        name="accessLogSubjects"
        label="대상"
        options={SUBJECT_OPTIONS}
        value={values.subjectOnly ? "subject" : "all"}
        onChange={(value) => go({ subjectOnly: value === "subject" })}
        size="sm"
      />
    </div>
  );
}

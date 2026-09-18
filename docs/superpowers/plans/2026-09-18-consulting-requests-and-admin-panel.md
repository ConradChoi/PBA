# Consulting Requests + Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the result page's "내 사업 구조 상담하기" CTA to a real consulting-request flow, and build an authenticated admin panel (consulting requests, all diagnoses, operator management) matching the approved Figma mockup.

**Architecture:** A new `consulting_requests` table (service_role-only, same access pattern as everything else) captures requests submitted from `/diagnose/result/[assessmentId]/consult`. The admin panel lives under `/admin`, gated by Supabase Auth via `@supabase/ssr` (a new dependency — the existing `@supabase/supabase-js` factories don't manage auth session cookies). Operator roles (`owner`/`staff`) live in `auth.users.app_metadata`, not a new table. Every list page (`/admin/consulting-requests`, `/admin/assessments`) has a real detail page of its own — not a link out to the public result page — because the public page intentionally omits admin-only fields (email, UTM, consent metadata) and the consulting request's own fields have nowhere else to live.

**Tech Stack:** Next.js 15 App Router, `@supabase/ssr` (new), Zod, Vitest (existing pattern).

**Spec:** `docs/superpowers/specs/2026-09-17-consulting-requests-and-admin-design.md` (read this first — it explains and justifies every decision below) and `data/PBA_7Layer_business_radar_requirements.md` section 20.

## Global Constraints

- Every Supabase write/read for consulting requests and operator management goes through `service_role` — `anon`/`authenticated` never touch `consulting_requests` directly (design spec section A).
- Admin API routes (`/api/admin/operators*`) must re-verify the caller's role server-side via `getCurrentOperator()` — never trust that the UI hid a button.
- `staff` cannot see or use `/admin/operators`, enforced both in the nav (doesn't render) and in the page/routes (403/redirect), independently.
- An owner can never delete their own account or the last remaining owner account (design spec section E).
- "결과 PDF 받기" is out of scope — do not build it as part of this plan.
- A consulting request is marked read on its own detail page view, not in bulk from the list (design spec Decision 8).

---

### Task 1: `consulting_requests` migration

**Files:**
- Create: `supabase/migrations/0006_consulting_requests.sql`

**Interfaces:**
- Produces: the `consulting_requests` table — consumed by every task below that touches consulting requests.

- [ ] **Step 1: Create the migration**

```sql
-- Consulting requests submitted from /diagnose/result/[assessmentId]/consult.
-- read_at is null until an operator opens the request's own detail page --
-- it backs the admin header's notification bell, not a processing status.
create table consulting_requests (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  preferred_contact text not null,
  message text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table consulting_requests enable row level security;
-- No policies granted to anon/authenticated: same pattern as assessment_drafts.
-- Only service_role can read/write; all access goes through server routes.
```

- [ ] **Step 2: Tell the user to apply it**

Report: "`0006_consulting_requests.sql`을 Supabase SQL Editor에서 실행해주세요." Tasks 2-3 don't touch this table and can proceed without waiting; Task 4 onward needs it applied.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0006_consulting_requests.sql
git commit -m "feat: add consulting_requests table"
```

---

### Task 2: Supabase Auth session infrastructure

**Files:**
- Modify: `package.json`
- Create: `src/lib/supabase/auth-browser.ts`
- Create: `src/lib/supabase/auth-server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `middleware.ts` (project root)

**Interfaces:**
- Produces: `createAuthBrowserClient()`, `createAuthServerClient()`, `updateSession(request)` — consumed by Task 3 (`getCurrentOperator`), Task 7 (login page, admin layout), Task 10 (admin API routes).

- [ ] **Step 1: Install `@supabase/ssr`**

Run: `npm install @supabase/ssr`

- [ ] **Step 2: Create `src/lib/supabase/auth-browser.ts`**

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createAuthBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Create `src/lib/supabase/auth-server.ts`**

```ts
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createAuthServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render, which can't mutate
            // cookies. middleware.ts already refreshes the session on
            // every request, so this is safe to ignore.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Create `src/lib/supabase/middleware.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (!user && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return response;
}
```

- [ ] **Step 5: Create `middleware.ts` at the project root**

```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/lib/supabase/auth-browser.ts src/lib/supabase/auth-server.ts src/lib/supabase/middleware.ts middleware.ts
git commit -m "feat: add Supabase Auth session infrastructure (@supabase/ssr)"
```

---

### Task 3: Operator identity (`getCurrentOperator`)

**Files:**
- Create: `src/lib/operators/get-current-operator.ts`
- Create: `src/lib/operators/get-current-operator.test.ts`

**Interfaces:**
- Consumes: `createAuthServerClient` (Task 2).
- Produces: `OperatorRole`, `CurrentOperator`, `getCurrentOperator(): Promise<CurrentOperator | null>` — consumed by Task 7 (login redirect, admin layout), Task 8-9 (owner-only gate on `/admin/operators`), Task 10 (API route guards).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/operators/get-current-operator.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
vi.mock("../supabase/auth-server", () => ({
  createAuthServerClient: async () => ({ auth: { getUser } }),
}));

beforeEach(() => {
  getUser.mockReset();
});

describe("getCurrentOperator", () => {
  it("returns null when there is no session", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });
    const { getCurrentOperator } = await import("./get-current-operator");

    expect(await getCurrentOperator()).toBeNull();
  });

  it("defaults to staff role when app_metadata.role is missing", async () => {
    getUser.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "a@ylia.io", app_metadata: {} } },
    });
    const { getCurrentOperator } = await import("./get-current-operator");

    expect(await getCurrentOperator()).toEqual({
      id: "u1",
      email: "a@ylia.io",
      role: "staff",
    });
  });

  it("reads the owner role from app_metadata", async () => {
    getUser.mockResolvedValueOnce({
      data: {
        user: { id: "u2", email: "owner@ylia.io", app_metadata: { role: "owner" } },
      },
    });
    const { getCurrentOperator } = await import("./get-current-operator");

    expect(await getCurrentOperator()).toEqual({
      id: "u2",
      email: "owner@ylia.io",
      role: "owner",
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/operators/get-current-operator.test.ts`
Expected: FAIL — `Cannot find module './get-current-operator'`

- [ ] **Step 3: Implement `src/lib/operators/get-current-operator.ts`**

```ts
import { createAuthServerClient } from "../supabase/auth-server";

export type OperatorRole = "owner" | "staff";

export type CurrentOperator = {
  id: string;
  email: string;
  role: OperatorRole;
};

export async function getCurrentOperator(): Promise<CurrentOperator | null> {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  const role = (user.app_metadata?.role as OperatorRole | undefined) ?? "staff";

  return { id: user.id, email: user.email, role };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/operators/get-current-operator.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/operators/get-current-operator.ts src/lib/operators/get-current-operator.test.ts
git commit -m "feat: add getCurrentOperator"
```

---

### Task 4: `POST /api/assessments/[assessmentId]/consulting-requests`

**Files:**
- Create: `src/lib/consulting/submit-consulting-request.schema.ts`
- Create: `src/app/api/assessments/[assessmentId]/consulting-requests/route.ts`
- Create: `src/app/api/assessments/[assessmentId]/consulting-requests/route.test.ts`

**Interfaces:**
- Consumes: `createServiceRoleSupabaseClient` (existing).
- Produces: `submitConsultingRequestSchema`, `POST` handler returning `201 { requestId }` / `400` / `404` — consumed by Task 5 (`ConsultForm`).

- [ ] **Step 1: Create `src/lib/consulting/submit-consulting-request.schema.ts`**

```ts
import { z } from "zod";

export const submitConsultingRequestSchema = z.object({
  preferredContact: z.string().min(1),
  message: z.string().optional(),
});

export type SubmitConsultingRequestPayload = z.infer<
  typeof submitConsultingRequestSchema
>;
```

- [ ] **Step 2: Write the failing tests**

Create `src/app/api/assessments/[assessmentId]/consulting-requests/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const assessmentMaybeSingle = vi.fn();
const assessmentEq = vi.fn(() => ({ maybeSingle: assessmentMaybeSingle }));
const assessmentSelect = vi.fn(() => ({ eq: assessmentEq }));

const updateEq = vi.fn().mockResolvedValue({ error: null });
const update = vi.fn(() => ({ eq: updateEq }));

const insertSingle = vi.fn();
const insertSelect = vi.fn(() => ({ single: insertSingle }));
const insert = vi.fn(() => ({ select: insertSelect }));

const from = vi.fn((table: string) =>
  table === "assessments" ? { select: assessmentSelect, update } : { insert }
);

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

beforeEach(() => {
  assessmentMaybeSingle.mockReset();
  insertSingle.mockReset();
  updateEq.mockClear();
  update.mockClear();
  assessmentEq.mockClear();
  assessmentSelect.mockClear();
  insertSelect.mockClear();
  insert.mockClear();
  from.mockClear();
});

function validPayload() {
  return { preferredContact: "010-1234-5678", message: "다음 주 통화 가능한가요?" };
}

describe("POST /api/assessments/[assessmentId]/consulting-requests", () => {
  it("inserts the request, flags the assessment, and returns 201", async () => {
    assessmentMaybeSingle.mockResolvedValueOnce({ data: { id: "assessment-1" }, error: null });
    insertSingle.mockResolvedValueOnce({ data: { id: "request-1" }, error: null });
    const { POST } = await import("./route");

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify(validPayload()),
    });
    const response = await POST(request, { params: Promise.resolve({ assessmentId: "assessment-1" }) });
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.requestId).toBe("request-1");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ assessment_id: "assessment-1", preferred_contact: "010-1234-5678" })
    );
    expect(update).toHaveBeenCalledWith({ consulting_requested: true });
    expect(updateEq).toHaveBeenCalledWith("id", "assessment-1");
  });

  it("returns 404 when the assessment doesn't exist", async () => {
    assessmentMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { POST } = await import("./route");

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify(validPayload()),
    });
    const response = await POST(request, { params: Promise.resolve({ assessmentId: "missing" }) });

    expect(response.status).toBe(404);
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns 400 for a payload missing preferredContact", async () => {
    const { POST } = await import("./route");

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ message: "no contact given" }),
    });
    const response = await POST(request, { params: Promise.resolve({ assessmentId: "assessment-1" }) });

    expect(response.status).toBe(400);
    expect(assessmentSelect).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run "src/app/api/assessments/[assessmentId]/consulting-requests/route.test.ts"`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 4: Implement `src/app/api/assessments/[assessmentId]/consulting-requests/route.ts`**

```ts
import { NextResponse } from "next/server";
import { submitConsultingRequestSchema } from "@/lib/consulting/submit-consulting-request.schema";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ assessmentId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { assessmentId } = await params;
  const body = await request.json();
  const parsed = submitConsultingRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();

  const { data: assessment, error: fetchError } = await supabase
    .from("assessments")
    .select("id")
    .eq("id", assessmentId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("consulting_requests")
    .insert({
      assessment_id: assessmentId,
      preferred_contact: parsed.data.preferredContact,
      message: parsed.data.message ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("assessments").update({ consulting_requested: true }).eq("id", assessmentId);

  return NextResponse.json({ requestId: data.id }, { status: 201 });
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run "src/app/api/assessments/[assessmentId]/consulting-requests/route.test.ts"`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/lib/consulting/submit-consulting-request.schema.ts "src/app/api/assessments/[assessmentId]/consulting-requests"
git commit -m "feat: add POST /api/assessments/[assessmentId]/consulting-requests"
```

---

### Task 5: Consult page + result page CTA wiring

**Files:**
- Create: `src/components/diagnose/ConsultForm.tsx`
- Create: `src/components/diagnose/ConsultingCtaLink.tsx`
- Create: `src/app/diagnose/result/[assessmentId]/consult/page.tsx`
- Create: `src/app/diagnose/result/[assessmentId]/consult/not-found.tsx`
- Modify: `src/app/diagnose/result/[assessmentId]/page.tsx`

**Interfaces:**
- Consumes: `getAssessmentById` (existing), `trackEvent` (existing), the consulting-requests route (Task 4).
- Produces: the consult flow's UI, and `radar_consulting_click`/`radar_consulting_submit` GA4 events.

- [ ] **Step 1: Create `src/components/diagnose/ConsultForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics/ga4";

export function ConsultForm({ assessmentId }: { assessmentId: string }) {
  const [preferredContact, setPreferredContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!preferredContact.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    const response = await fetch(`/api/assessments/${assessmentId}/consulting-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        preferredContact,
        message: message || undefined,
      }),
    });

    if (!response.ok) {
      setError("신청을 접수하지 못했습니다. 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    trackEvent("radar_consulting_submit");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-base font-semibold text-slate-900">신청이 접수되었습니다</p>
        <p className="mt-2 text-sm text-slate-600">
          확인 후 남겨주신 연락처로 연락드리겠습니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-slate-700">선호 연락처 *</span>
        <input
          value={preferredContact}
          onChange={(e) => setPreferredContact(e.target.value)}
          placeholder="010-1234-5678 또는 이메일로 연락 주세요"
          className="rounded-lg border border-slate-200 px-3.5 py-2.5"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-slate-700">전달하고 싶은 말 (선택)</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="rounded-lg border border-slate-200 px-3.5 py-2.5"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!preferredContact.trim() || submitting}
        className="rounded-full bg-slate-900 py-4 text-sm font-semibold text-white disabled:opacity-40"
      >
        {submitting ? "접수하는 중..." : "상담 신청하기"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create `src/components/diagnose/ConsultingCtaLink.tsx`**

```tsx
"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics/ga4";

export function ConsultingCtaLink({ assessmentId }: { assessmentId: string }) {
  return (
    <Link
      href={`/diagnose/result/${assessmentId}/consult`}
      onClick={() => trackEvent("radar_consulting_click")}
      className="block rounded-full bg-slate-900 py-4 text-center text-sm font-semibold text-white"
    >
      내 사업 구조 상담하기
    </Link>
  );
}
```

- [ ] **Step 3: Create `src/app/diagnose/result/[assessmentId]/consult/not-found.tsx`**

```tsx
import Link from "next/link";

export default function ConsultNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-bold">결과를 찾을 수 없습니다</h1>
      <p className="text-sm text-slate-600">
        링크가 잘못되었거나 만료되었을 수 있습니다.
      </p>
      <Link href="/diagnose" className="text-sm font-semibold text-indigo-600 underline">
        새로 진단 시작하기
      </Link>
    </main>
  );
}
```

- [ ] **Step 4: Create `src/app/diagnose/result/[assessmentId]/consult/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { getAssessmentById } from "@/lib/assessments/get-assessment";
import { ConsultForm } from "@/components/diagnose/ConsultForm";

export default async function ConsultPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  const assessment = await getAssessmentById(assessmentId);

  if (!assessment) {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          PBA 7-Layer Business Radar
        </p>
        <h1 className="text-2xl font-bold">상담 신청</h1>
        <p className="text-sm text-slate-500">
          {assessment.name}님의 진단 결과를 바탕으로 상담을 도와드리겠습니다.
        </p>
      </div>
      <ConsultForm assessmentId={assessmentId} />
    </main>
  );
}
```

- [ ] **Step 5: Wire the CTA on the result page**

In `src/app/diagnose/result/[assessmentId]/page.tsx`, add the import:

```ts
import { ConsultingCtaLink } from "@/components/diagnose/ConsultingCtaLink";
```

Then replace the existing plain `<button>내 사업 구조 상담하기</button>` (inside the CTA `<section>`) with:

```tsx
<ConsultingCtaLink assessmentId={assessmentId} />
```

(Leave the "결과 PDF 받기" button as-is — it's still a no-op, Phase 2.)

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: `Compiled successfully`, `/diagnose/result/[assessmentId]/consult` appears as a dynamic route.

- [ ] **Step 7: Commit**

```bash
git add src/components/diagnose/ConsultForm.tsx src/components/diagnose/ConsultingCtaLink.tsx "src/app/diagnose/result/[assessmentId]/consult" "src/app/diagnose/result/[assessmentId]/page.tsx"
git commit -m "feat: add consult page and wire result page CTA"
```

---

### Task 6: Admin data-access layer

**Files:**
- Create: `src/lib/consulting/get-consulting-requests.ts`
- Create: `src/lib/consulting/get-consulting-requests.test.ts`
- Modify: `src/lib/assessments/get-assessment.ts`
- Modify: `src/lib/assessments/get-assessment.test.ts`

**Interfaces:**
- Consumes: `createServiceRoleSupabaseClient` (existing).
- Produces: `listConsultingRequests`, `getConsultingRequestById`, `markConsultingRequestRead`, `countUnreadConsultingRequests`, `listAssessments`, `getAssessmentsByIds` — consumed by Tasks 7-9 (admin pages).

- [ ] **Step 1: Write the failing tests for `get-consulting-requests.ts`**

Create `src/lib/consulting/get-consulting-requests.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const order = vi.fn();
const selectForList = vi.fn(() => ({ order }));

const maybeSingle = vi.fn();
const eqForGetById = vi.fn(() => ({ maybeSingle }));
const selectForGetById = vi.fn(() => ({ eq: eqForGetById }));

const isForUpdate = vi.fn().mockResolvedValue({ error: null });
const eqForUpdate = vi.fn(() => ({ is: isForUpdate }));
const update = vi.fn(() => ({ eq: eqForUpdate }));

const isForCount = vi.fn();
const selectForCount = vi.fn(() => ({ is: isForCount }));

const from = vi.fn(() => ({
  select: vi.fn((columns: string, opts?: { count?: string; head?: boolean }) =>
    opts?.count ? selectForCount() : columns === "*" && !from.mock.calls.length
      ? selectForList()
      : selectForList()
  ),
  update,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

beforeEach(() => {
  order.mockReset();
  maybeSingle.mockReset();
  isForUpdate.mockClear();
  eqForUpdate.mockClear();
  update.mockClear();
  isForCount.mockReset();
  eqForGetById.mockClear();
  from.mockClear();
});
```

Since a single generic `from().select()` mock covering three different call shapes (plain list, `.eq().maybeSingle()`, and `count/head`) gets fragile fast, replace the shared mock above with **one dedicated `from` mock per test** instead — write each test self-contained:

```ts
describe("listConsultingRequests", () => {
  it("returns rows ordered newest first", async () => {
    const orderFn = vi.fn().mockResolvedValue({
      data: [{ id: "r1", assessment_id: "a1", preferred_contact: "010", message: null, created_at: "2026-09-18T00:00:00Z", read_at: null }],
      error: null,
    });
    const select = vi.fn(() => ({ order: orderFn }));
    const fromFn = vi.fn(() => ({ select }));
    vi.doMock("@/lib/supabase/server", () => ({
      createServiceRoleSupabaseClient: () => ({ from: fromFn }),
    }));
    vi.resetModules();
    const { listConsultingRequests } = await import("./get-consulting-requests");

    const result = await listConsultingRequests();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("r1");
    expect(orderFn).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});

describe("getConsultingRequestById", () => {
  it("returns the row when found", async () => {
    const maybeSingleFn = vi.fn().mockResolvedValue({
      data: { id: "r1", assessment_id: "a1", preferred_contact: "010", message: null, created_at: "2026-09-18T00:00:00Z", read_at: null },
      error: null,
    });
    const eq = vi.fn(() => ({ maybeSingle: maybeSingleFn }));
    const select = vi.fn(() => ({ eq }));
    const fromFn = vi.fn(() => ({ select }));
    vi.doMock("@/lib/supabase/server", () => ({
      createServiceRoleSupabaseClient: () => ({ from: fromFn }),
    }));
    vi.resetModules();
    const { getConsultingRequestById } = await import("./get-consulting-requests");

    const result = await getConsultingRequestById("r1");

    expect(result?.id).toBe("r1");
    expect(eq).toHaveBeenCalledWith("id", "r1");
  });

  it("returns null when not found", async () => {
    const maybeSingleFn = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn(() => ({ maybeSingle: maybeSingleFn }));
    const select = vi.fn(() => ({ eq }));
    const fromFn = vi.fn(() => ({ select }));
    vi.doMock("@/lib/supabase/server", () => ({
      createServiceRoleSupabaseClient: () => ({ from: fromFn }),
    }));
    vi.resetModules();
    const { getConsultingRequestById } = await import("./get-consulting-requests");

    expect(await getConsultingRequestById("missing")).toBeNull();
  });
});

describe("markConsultingRequestRead", () => {
  it("updates read_at only where it was null", async () => {
    const isFn = vi.fn().mockResolvedValue({ error: null });
    const eq = vi.fn(() => ({ is: isFn }));
    const update = vi.fn(() => ({ eq }));
    const fromFn = vi.fn(() => ({ update }));
    vi.doMock("@/lib/supabase/server", () => ({
      createServiceRoleSupabaseClient: () => ({ from: fromFn }),
    }));
    vi.resetModules();
    const { markConsultingRequestRead } = await import("./get-consulting-requests");

    await markConsultingRequestRead("r1");

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ read_at: expect.any(String) }));
    expect(eq).toHaveBeenCalledWith("id", "r1");
    expect(isFn).toHaveBeenCalledWith("read_at", null);
  });
});

describe("countUnreadConsultingRequests", () => {
  it("returns the unread count", async () => {
    const isFn = vi.fn().mockResolvedValue({ count: 3, error: null });
    const select = vi.fn(() => ({ is: isFn }));
    const fromFn = vi.fn(() => ({ select }));
    vi.doMock("@/lib/supabase/server", () => ({
      createServiceRoleSupabaseClient: () => ({ from: fromFn }),
    }));
    vi.resetModules();
    const { countUnreadConsultingRequests } = await import("./get-consulting-requests");

    expect(await countUnreadConsultingRequests()).toBe(3);
    expect(select).toHaveBeenCalledWith("id", { count: "exact", head: true });
  });

  it("returns 0 when count is null", async () => {
    const isFn = vi.fn().mockResolvedValue({ count: null, error: null });
    const select = vi.fn(() => ({ is: isFn }));
    const fromFn = vi.fn(() => ({ select }));
    vi.doMock("@/lib/supabase/server", () => ({
      createServiceRoleSupabaseClient: () => ({ from: fromFn }),
    }));
    vi.resetModules();
    const { countUnreadConsultingRequests } = await import("./get-consulting-requests");

    expect(await countUnreadConsultingRequests()).toBe(0);
  });
});
```

Delete the shared top-level mock scaffold from the first code block above (the `order`/`selectForList`/generic `from` variables and its `beforeEach`) — each `describe` block sets up and tears down its own mock via `vi.doMock` + `vi.resetModules()` instead, since the four functions have incompatible chain shapes.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/consulting/get-consulting-requests.test.ts`
Expected: FAIL — `Cannot find module './get-consulting-requests'`

- [ ] **Step 3: Implement `src/lib/consulting/get-consulting-requests.ts`**

```ts
import { createServiceRoleSupabaseClient } from "../supabase/server";

export type ConsultingRequestRow = {
  id: string;
  assessment_id: string;
  preferred_contact: string;
  message: string | null;
  created_at: string;
  read_at: string | null;
};

export async function listConsultingRequests(): Promise<ConsultingRequestRow[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("consulting_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ConsultingRequestRow[];
}

export async function getConsultingRequestById(
  id: string
): Promise<ConsultingRequestRow | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("consulting_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ConsultingRequestRow | null;
}

export async function markConsultingRequestRead(id: string): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("consulting_requests")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function countUnreadConsultingRequests(): Promise<number> {
  const supabase = createServiceRoleSupabaseClient();
  const { count, error } = await supabase
    .from("consulting_requests")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/consulting/get-consulting-requests.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Add `listAssessments`/`getAssessmentsByIds` to `src/lib/assessments/get-assessment.ts`**

Append to the end of the existing file:

```ts

export async function listAssessments(): Promise<AssessmentRow[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AssessmentRow[];
}

export async function getAssessmentsByIds(ids: string[]): Promise<AssessmentRow[]> {
  if (ids.length === 0) {
    return [];
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase.from("assessments").select("*").in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AssessmentRow[];
}
```

- [ ] **Step 6: Add tests for both to `src/lib/assessments/get-assessment.test.ts`**

Append:

```ts

describe("listAssessments", () => {
  it("returns rows ordered newest first", async () => {
    const orderFn = vi.fn().mockResolvedValue({ data: [{ id: "a1" }], error: null });
    const select = vi.fn(() => ({ order: orderFn }));
    const fromFn = vi.fn(() => ({ select }));
    vi.doMock("@/lib/supabase/server", () => ({
      createServiceRoleSupabaseClient: () => ({ from: fromFn }),
    }));
    vi.resetModules();
    const { listAssessments } = await import("./get-assessment");

    const result = await listAssessments();

    expect(result).toEqual([{ id: "a1" }]);
    expect(orderFn).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});

describe("getAssessmentsByIds", () => {
  it("returns [] without querying when given no ids", async () => {
    const fromFn = vi.fn();
    vi.doMock("@/lib/supabase/server", () => ({
      createServiceRoleSupabaseClient: () => ({ from: fromFn }),
    }));
    vi.resetModules();
    const { getAssessmentsByIds } = await import("./get-assessment");

    expect(await getAssessmentsByIds([])).toEqual([]);
    expect(fromFn).not.toHaveBeenCalled();
  });

  it("queries with an 'in' filter for the given ids", async () => {
    const inFn = vi.fn().mockResolvedValue({ data: [{ id: "a1" }, { id: "a2" }], error: null });
    const select = vi.fn(() => ({ in: inFn }));
    const fromFn = vi.fn(() => ({ select }));
    vi.doMock("@/lib/supabase/server", () => ({
      createServiceRoleSupabaseClient: () => ({ from: fromFn }),
    }));
    vi.resetModules();
    const { getAssessmentsByIds } = await import("./get-assessment");

    const result = await getAssessmentsByIds(["a1", "a2"]);

    expect(result).toHaveLength(2);
    expect(inFn).toHaveBeenCalledWith("id", ["a1", "a2"]);
  });
});
```

Add `vi.resetModules()`-safe imports at the top of the file if not already present — this file's existing tests use a static top-level mock (`vi.mock("@/lib/supabase/server", ...)` with shared `from`), which conflicts with the new tests' per-test `vi.doMock` + `vi.resetModules()` pattern. Resolve by converting **this file's existing tests** (`getAssessmentById`) to the same per-test `vi.doMock`/`vi.resetModules()` style so the whole file is consistent — do this as part of this step, re-running the full file's tests afterward to confirm nothing broke.

- [ ] **Step 7: Run the full assessments test file**

Run: `npx vitest run src/lib/assessments/get-assessment.test.ts`
Expected: PASS (7 tests: the original 3 + 4 new)

- [ ] **Step 8: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/lib/consulting/get-consulting-requests.ts src/lib/consulting/get-consulting-requests.test.ts src/lib/assessments/get-assessment.ts src/lib/assessments/get-assessment.test.ts
git commit -m "feat: add admin data-access layer (consulting requests, assessments list)"
```

---

### Task 7: Admin login page + shared dashboard layout

**Files:**
- Create: `src/components/admin/AdminNav.tsx`
- Create: `src/components/admin/LogoutButton.tsx`
- Create: `src/components/admin/NotificationBell.tsx`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/(dashboard)/layout.tsx`
- Create: `src/app/admin/(dashboard)/page.tsx`

**Interfaces:**
- Consumes: `createAuthBrowserClient` (Task 2), `getCurrentOperator` (Task 3), `countUnreadConsultingRequests` (Task 6).
- Produces: the shell every other admin page in Tasks 8-9, 11 renders inside.

- [ ] **Step 1: Create `src/components/admin/AdminNav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/consulting-requests", label: "상담 신청" },
  { href: "/admin/assessments", label: "전체 진단" },
];

export function AdminNav({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();
  const items = isOwner
    ? [...NAV_ITEMS, { href: "/admin/operators", label: "운영자 관리" }]
    : NAV_ITEMS;

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
              active ? "bg-slate-800 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Create `src/components/admin/LogoutButton.tsx`**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { createAuthBrowserClient } from "@/lib/supabase/auth-browser";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createAuthBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-500"
    >
      로그아웃
    </button>
  );
}
```

- [ ] **Step 3: Create `src/components/admin/NotificationBell.tsx`**

```tsx
import Link from "next/link";

export function NotificationBell({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      href="/admin/consulting-requests"
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200"
      aria-label={`읽지 않은 상담 신청 ${unreadCount}건`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          stroke="#334155"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white bg-red-500" />
      )}
    </Link>
  );
}
```

- [ ] **Step 4: Create `src/app/admin/login/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthBrowserClient } from "@/lib/supabase/auth-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createAuthBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setSubmitting(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-9">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">PBA ADMIN</p>
        <h1 className="mt-1 text-2xl font-bold">관리자 로그인</h1>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-slate-200 px-3.5 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-slate-200 px-3.5 py-2.5"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {submitting ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Create `src/app/admin/(dashboard)/layout.tsx`**

The `(dashboard)` route group applies this layout to every `/admin/*` page except `/admin/login`, without changing any URL.

```tsx
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
```

- [ ] **Step 6: Create `src/app/admin/(dashboard)/page.tsx`**

```tsx
import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  redirect("/admin/consulting-requests");
}
```

- [ ] **Step 7: Verify the build**

Run: `npm run build`
Expected: `Compiled successfully` (the list/detail pages the layout renders don't exist yet — that's fine, the build only needs the layout and login page to compile; `/admin` itself will 404 on its redirect target until Task 8, which is expected at this point).

- [ ] **Step 8: Commit**

```bash
git add src/components/admin src/app/admin/login "src/app/admin/(dashboard)/layout.tsx" "src/app/admin/(dashboard)/page.tsx"
git commit -m "feat: add admin login page and shared dashboard shell"
```

---

### Task 8: `/admin/consulting-requests` list + detail

**Files:**
- Create: `src/app/admin/(dashboard)/consulting-requests/page.tsx`
- Create: `src/app/admin/(dashboard)/consulting-requests/[requestId]/page.tsx`
- Create: `src/app/admin/(dashboard)/consulting-requests/[requestId]/not-found.tsx`

**Interfaces:**
- Consumes: `listConsultingRequests`, `getConsultingRequestById`, `markConsultingRequestRead` (Task 6), `getAssessmentsByIds`, `getAssessmentById` (Task 6 / existing).

- [ ] **Step 1: Create `src/app/admin/(dashboard)/consulting-requests/page.tsx`**

```tsx
import Link from "next/link";
import { listConsultingRequests } from "@/lib/consulting/get-consulting-requests";
import { getAssessmentsByIds } from "@/lib/assessments/get-assessment";

export default async function ConsultingRequestsPage() {
  const requests = await listConsultingRequests();
  const assessments = await getAssessmentsByIds(requests.map((r) => r.assessment_id));
  const assessmentById = new Map(assessments.map((a) => [a.id, a]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">상담 신청</h1>
        <p className="mt-1 text-sm text-slate-500">
          결과 페이지에서 접수된 상담 요청 목록입니다.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3.5">신청일</th>
              <th className="px-4 py-3.5">이름</th>
              <th className="px-4 py-3.5">선호 연락처</th>
              <th className="px-4 py-3.5">메시지</th>
              <th className="px-4 py-3.5">진단 등급</th>
              <th className="px-4 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const assessment = assessmentById.get(r.assessment_id);
              return (
                <tr key={r.id} className="border-t border-slate-200">
                  <td className="px-4 py-3.5">
                    {new Date(r.created_at).toLocaleDateString("ko-KR")}
                    {!r.read_at && (
                      <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                        NEW
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">{assessment?.name ?? "-"}</td>
                  <td className="px-4 py-3.5">{r.preferred_contact}</td>
                  <td className="max-w-xs truncate px-4 py-3.5">{r.message ?? "-"}</td>
                  <td className="px-4 py-3.5 font-semibold text-indigo-600">
                    {assessment?.architecture_level ?? "-"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/admin/consulting-requests/${r.id}`}
                      className="font-semibold text-indigo-600"
                    >
                      보기 →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/admin/(dashboard)/consulting-requests/[requestId]/not-found.tsx`**

```tsx
import Link from "next/link";

export default function ConsultingRequestNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <h1 className="text-lg font-bold">상담 신청을 찾을 수 없습니다</h1>
      <Link href="/admin/consulting-requests" className="text-sm font-semibold text-indigo-600 underline">
        목록으로 돌아가기
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/admin/(dashboard)/consulting-requests/[requestId]/page.tsx`**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getConsultingRequestById,
  markConsultingRequestRead,
} from "@/lib/consulting/get-consulting-requests";
import { getAssessmentById } from "@/lib/assessments/get-assessment";

export default async function ConsultingRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const request = await getConsultingRequestById(requestId);

  if (!request) {
    notFound();
  }

  if (!request.read_at) {
    await markConsultingRequestRead(requestId);
  }

  const assessment = await getAssessmentById(request.assessment_id);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/consulting-requests" className="text-sm text-slate-500">
          ← 상담 신청 목록
        </Link>
        <h1 className="mt-2 text-2xl font-bold">상담 신청 상세</h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date(request.created_at).toLocaleString("ko-KR")} 접수
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-6">
        <div>
          <p className="text-xs font-semibold text-slate-500">선호 연락처</p>
          <p className="mt-1 text-sm text-slate-900">{request.preferred_contact}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">전달하고 싶은 말</p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-900">
            {request.message ?? "-"}
          </p>
        </div>
      </div>

      {assessment && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-xs font-semibold text-slate-500">연결된 진단</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-500">이름</p>
              <p className="font-medium">{assessment.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">이메일</p>
              <p className="font-medium">{assessment.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">사업 단계</p>
              <p className="font-medium">{assessment.business_stage}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">점수</p>
              <p className="font-medium">{assessment.total_raw} / 140</p>
            </div>
          </div>
          <Link
            href={`/diagnose/result/${assessment.id}`}
            className="w-fit text-sm font-semibold text-indigo-600"
          >
            전체 진단 결과 보기 →
          </Link>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add "src/app/admin/(dashboard)/consulting-requests"
git commit -m "feat: add admin consulting-requests list and detail pages"
```

---

### Task 9: `/admin/assessments` list + detail

**Files:**
- Create: `src/app/admin/(dashboard)/assessments/page.tsx`
- Create: `src/app/admin/(dashboard)/assessments/[assessmentId]/page.tsx`
- Create: `src/app/admin/(dashboard)/assessments/[assessmentId]/not-found.tsx`

**Interfaces:**
- Consumes: `listAssessments`, `getAssessmentById` (Task 6 / existing).

- [ ] **Step 1: Create `src/app/admin/(dashboard)/assessments/page.tsx`**

```tsx
import Link from "next/link";
import { listAssessments } from "@/lib/assessments/get-assessment";

export default async function AssessmentsPage() {
  const assessments = await listAssessments();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">전체 진단</h1>
        <p className="mt-1 text-sm text-slate-500">지금까지 완료된 모든 진단 결과입니다.</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3.5">진단일</th>
              <th className="px-4 py-3.5">이름</th>
              <th className="px-4 py-3.5">이메일</th>
              <th className="px-4 py-3.5">사업단계</th>
              <th className="px-4 py-3.5">진단 등급</th>
              <th className="px-4 py-3.5">점수</th>
              <th className="px-4 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => (
              <tr key={a.id} className="border-t border-slate-200">
                <td className="px-4 py-3.5">
                  {new Date(a.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-3.5">{a.name}</td>
                <td className="px-4 py-3.5">{a.email}</td>
                <td className="px-4 py-3.5">{a.business_stage}</td>
                <td className="px-4 py-3.5 font-semibold text-indigo-600">
                  {a.architecture_level}
                </td>
                <td className="px-4 py-3.5">{a.total_raw} / 140</td>
                <td className="px-4 py-3.5 text-right">
                  <Link href={`/admin/assessments/${a.id}`} className="font-semibold text-indigo-600">
                    보기 →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/admin/(dashboard)/assessments/[assessmentId]/not-found.tsx`**

```tsx
import Link from "next/link";

export default function AssessmentNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <h1 className="text-lg font-bold">진단을 찾을 수 없습니다</h1>
      <Link href="/admin/assessments" className="text-sm font-semibold text-indigo-600 underline">
        목록으로 돌아가기
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/admin/(dashboard)/assessments/[assessmentId]/page.tsx`**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssessmentById } from "@/lib/assessments/get-assessment";

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  const assessment = await getAssessmentById(assessmentId);

  if (!assessment) {
    notFound();
  }

  const fields: [string, string][] = [
    ["이름", assessment.name],
    ["이메일", assessment.email],
    ["회사/브랜드명", assessment.company_name ?? "-"],
    ["역할", assessment.role ?? "-"],
    ["사업 단계", assessment.business_stage],
    ["업종", assessment.industry ?? "-"],
    ["팀 규모", assessment.team_size ?? "-"],
    ["총점", `${assessment.total_raw} / 140`],
    ["Architecture Level", assessment.architecture_level],
    [
      "Bottleneck",
      `${assessment.bottleneck_1}, ${assessment.bottleneck_2}, ${assessment.bottleneck_3}`,
    ],
    ["Strength", `${assessment.strength_1}, ${assessment.strength_2}`],
    ["상담 신청 여부", assessment.consulting_requested ? "예" : "아니오"],
    [
      "개인정보 동의",
      `${assessment.privacy_consent ? "동의" : "미동의"} (${assessment.privacy_notice_version})`,
    ],
    ["마케팅 동의", assessment.marketing_consent ? "동의" : "미동의"],
    [
      "UTM",
      [assessment.utm_source, assessment.utm_medium, assessment.utm_campaign]
        .filter(Boolean)
        .join(" / ") || "-",
    ],
    ["진단일", new Date(assessment.created_at).toLocaleString("ko-KR")],
  ];

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/assessments" className="text-sm text-slate-500">
          ← 전체 진단 목록
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{assessment.name}님의 진단</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-6 text-sm">
        {fields.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-0.5 font-medium text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <Link
        href={`/diagnose/result/${assessment.id}`}
        className="w-fit text-sm font-semibold text-indigo-600"
      >
        공개 결과 화면 보기 →
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add "src/app/admin/(dashboard)/assessments"
git commit -m "feat: add admin assessments list and detail pages"
```

---

### Task 10: Operator management API

**Files:**
- Create: `src/lib/operators/list-operators.ts`
- Create: `src/lib/operators/create-operator.schema.ts`
- Create: `src/app/api/admin/operators/route.ts`
- Create: `src/app/api/admin/operators/route.test.ts`
- Create: `src/app/api/admin/operators/[userId]/route.ts`
- Create: `src/app/api/admin/operators/[userId]/route.test.ts`

**Interfaces:**
- Consumes: `getCurrentOperator`, `OperatorRole` (Task 3), `createServiceRoleSupabaseClient` (existing).
- Produces: `listOperators`, `countOwners`, `createOperatorSchema`, the two API routes — consumed by Task 11 (`/admin/operators` page).

- [ ] **Step 1: Create `src/lib/operators/list-operators.ts`**

```ts
import { createServiceRoleSupabaseClient } from "../supabase/server";
import type { OperatorRole } from "./get-current-operator";

export type OperatorListItem = {
  id: string;
  email: string;
  role: OperatorRole;
  created_at: string;
};

export async function listOperators(): Promise<OperatorListItem[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw new Error(error.message);
  }

  return data.users
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      role: (u.app_metadata?.role as OperatorRole | undefined) ?? "staff",
      created_at: u.created_at,
    }))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}
```

- [ ] **Step 2: Create `src/lib/operators/create-operator.schema.ts`**

```ts
import { z } from "zod";

export const createOperatorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["owner", "staff"]),
});

export type CreateOperatorPayload = z.infer<typeof createOperatorSchema>;
```

- [ ] **Step 3: Write the failing tests for `POST /api/admin/operators`**

Create `src/app/api/admin/operators/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentOperator = vi.fn();
vi.mock("@/lib/operators/get-current-operator", () => ({
  getCurrentOperator: () => getCurrentOperator(),
}));

const createUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ auth: { admin: { createUser } } }),
}));

function validPayload() {
  return { email: "new-staff@ylia.io", password: "temp-password-1", role: "staff" as const };
}

beforeEach(() => {
  getCurrentOperator.mockReset();
  createUser.mockReset();
});

describe("POST /api/admin/operators", () => {
  it("returns 403 when the caller is not an owner", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify(validPayload()) })
    );

    expect(response.status).toBe(403);
    expect(createUser).not.toHaveBeenCalled();
  });

  it("returns 403 when there is no session", async () => {
    getCurrentOperator.mockResolvedValueOnce(null);
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify(validPayload()) })
    );

    expect(response.status).toBe(403);
  });

  it("creates the operator and returns 201 for an owner", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "owner1", email: "owner@ylia.io", role: "owner" });
    createUser.mockResolvedValueOnce({ data: { user: { id: "new-id" } }, error: null });
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify(validPayload()) })
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.id).toBe("new-id");
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new-staff@ylia.io", app_metadata: { role: "staff" } })
    );
  });

  it("returns 400 for an invalid payload", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "owner1", email: "owner@ylia.io", role: "owner" });
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ email: "not-an-email" }),
      })
    );

    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `npx vitest run src/app/api/admin/operators/route.test.ts`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 5: Implement `src/app/api/admin/operators/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/operators/get-current-operator";
import { createOperatorSchema } from "@/lib/operators/create-operator.schema";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const operator = await getCurrentOperator();

  if (!operator || operator.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createOperatorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: { role: parsed.data.role },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.user.id }, { status: 201 });
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run src/app/api/admin/operators/route.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 7: Write the failing tests for `DELETE /api/admin/operators/[userId]`**

Create `src/app/api/admin/operators/[userId]/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentOperator = vi.fn();
vi.mock("@/lib/operators/get-current-operator", () => ({
  getCurrentOperator: () => getCurrentOperator(),
}));

const listOperators = vi.fn();
vi.mock("@/lib/operators/list-operators", () => ({
  listOperators: () => listOperators(),
}));

const deleteUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ auth: { admin: { deleteUser } } }),
}));

beforeEach(() => {
  getCurrentOperator.mockReset();
  listOperators.mockReset();
  deleteUser.mockReset();
});

describe("DELETE /api/admin/operators/[userId]", () => {
  it("returns 403 when the caller is not an owner", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ userId: "target" }),
    });

    expect(response.status).toBe(403);
  });

  it("returns 400 when an owner tries to delete their own account", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "owner1", email: "owner@ylia.io", role: "owner" });
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ userId: "owner1" }),
    });

    expect(response.status).toBe(400);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("returns 400 when deleting the last remaining owner", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "owner1", email: "owner@ylia.io", role: "owner" });
    listOperators.mockResolvedValueOnce([
      { id: "target", email: "target@ylia.io", role: "owner", created_at: "2026-01-02" },
    ]);
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ userId: "target" }),
    });

    expect(response.status).toBe(400);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("deletes a staff operator when called by an owner", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "owner1", email: "owner@ylia.io", role: "owner" });
    listOperators.mockResolvedValueOnce([
      { id: "owner1", email: "owner@ylia.io", role: "owner", created_at: "2026-01-01" },
      { id: "target", email: "target@ylia.io", role: "staff", created_at: "2026-01-02" },
    ]);
    deleteUser.mockResolvedValueOnce({ error: null });
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ userId: "target" }),
    });

    expect(response.status).toBe(200);
    expect(deleteUser).toHaveBeenCalledWith("target");
  });
});
```

- [ ] **Step 8: Run the tests to verify they fail**

Run: `npx vitest run "src/app/api/admin/operators/[userId]/route.test.ts"`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 9: Implement `src/app/api/admin/operators/[userId]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/operators/get-current-operator";
import { listOperators } from "@/lib/operators/list-operators";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ userId: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  const operator = await getCurrentOperator();

  if (!operator || operator.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;

  if (userId === operator.id) {
    return NextResponse.json({ error: "본인 계정은 삭제할 수 없습니다." }, { status: 400 });
  }

  const operators = await listOperators();
  const target = operators.find((o) => o.id === userId);
  const ownerCount = operators.filter((o) => o.role === "owner").length;

  if (target?.role === "owner" && ownerCount <= 1) {
    return NextResponse.json(
      { error: "마지막 owner 계정은 삭제할 수 없습니다." },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 10: Run the tests to verify they pass**

Run: `npx vitest run "src/app/api/admin/operators/[userId]/route.test.ts"`
Expected: PASS (4 tests)

- [ ] **Step 11: Typecheck and run the full suite**

Run: `npm run typecheck && npm test`
Expected: no type errors, all tests pass.

- [ ] **Step 12: Commit**

```bash
git add src/lib/operators/list-operators.ts src/lib/operators/create-operator.schema.ts src/app/api/admin/operators
git commit -m "feat: add operator management API (create/delete, owner-only)"
```

---

### Task 11: `/admin/operators` page

**Files:**
- Create: `src/components/admin/OperatorsTable.tsx`
- Create: `src/app/admin/(dashboard)/operators/page.tsx`

**Interfaces:**
- Consumes: `getCurrentOperator` (Task 3), `listOperators`, `OperatorListItem` (Task 10), the two operator API routes (Task 10).

- [ ] **Step 1: Create `src/components/admin/OperatorsTable.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { OperatorListItem } from "@/lib/operators/list-operators";
import type { OperatorRole } from "@/lib/operators/get-current-operator";

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
    const response = await fetch(`/api/admin/operators/${id}`, { method: "DELETE" });
    const json = await response.json();

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
                      onClick={() => handleDelete(o.id)}
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
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/admin/(dashboard)/operators/page.tsx`**

```tsx
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
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: `Compiled successfully`. Full route list should now include `/admin`, `/admin/login`, `/admin/consulting-requests(+[requestId])`, `/admin/assessments(+[assessmentId])`, `/admin/operators`.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/OperatorsTable.tsx "src/app/admin/(dashboard)/operators"
git commit -m "feat: add admin operators page"
```

---

### Task 12: Bootstrap the first owner account

**Files:** none (operational step, not application code)

**Interfaces:** none

- [ ] **Step 1: Confirm migrations are applied**

Confirm with the user that `0006_consulting_requests.sql` (Task 1) is applied, and ask which email they want as their own login (their existing `info@ylia.io` or another address) and whether they want to choose a temporary password or have one generated.

- [ ] **Step 2: Create the account via the Supabase Admin API**

Using the project's `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (already in `.env.local`), run a one-off script (in the scratchpad directory, not committed) that calls:

```ts
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: "<the address the user chose>",
    password: "<temporary password>",
    email_confirm: true,
    app_metadata: { role: "owner" },
  });

  if (error) throw error;
  console.log("Created operator:", data.user.id, data.user.email);
}

main();
```

- [ ] **Step 3: Verify login**

With the app running (`npm run dev`), log in at `/admin/login` with the new account and confirm it lands on `/admin/consulting-requests` with the `운영자 관리` nav item visible (owner role confirmed).

- [ ] **Step 4: Report the credentials to the user directly** (not written to any file in the repo).

---

### Task 13: README update + full manual verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update `README.md`**

Read the current file, then extend the "Scope of this codebase so far" section to mention the consulting-request flow and admin panel, and add a short "Admin panel" subsection describing `/admin/login`, the three sections, and that the first account is bootstrapped outside the app (per Task 12) — mirroring the style of the existing GA4/Supabase setup notes.

- [ ] **Step 2: Full manual verification**

With `npm run dev` running and all migrations (0001-0006) applied:

1. Complete a diagnosis end-to-end (reuse the flow from the diagnose-flow plan) to get a fresh `assessmentId`.
2. On the result page, click "내 사업 구조 상담하기" → confirm it lands on `/diagnose/result/<id>/consult`.
3. Submit the consult form → confirm the in-place "신청이 접수되었습니다" message appears.
4. In Supabase Studio, confirm a `consulting_requests` row exists with `read_at = null`, and the linked `assessments` row now has `consulting_requested = true`.
5. Log in to `/admin/login` with the bootstrapped owner account.
6. On `/admin/consulting-requests`, confirm the new request appears with a "NEW" badge, and the header bell shows a red dot.
7. Click into the request's detail page → confirm the full message and the linked assessment's name/email/level render, then go back to the list and confirm the "NEW" badge and bell dot are both gone.
8. Visit `/admin/assessments`, confirm the new diagnosis appears, click into its detail page, and confirm it shows `email` and other fields absent from the public result page.
9. Go to `/admin/operators`, add a `staff` account with a temporary password, log out, log in as that `staff` account, and confirm: both lists are visible, the "운영자 관리" nav item is absent, and a direct visit to `/admin/operators` redirects away.
10. As `staff`, use `curl` (or the browser devtools network tab) to call `POST /api/admin/operators` directly and confirm it returns `403`.
11. Log back in as the owner, delete the test `staff` account from `/admin/operators`, and confirm it disappears from the list.

Report the outcome of each of these 11 checks back to the user.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README for consulting requests and admin panel"
```

---

## Self-Review Notes

- **Spec coverage:** design spec sections A (data model incl. `read_at`), B (consult flow), C (auth infra), D (all 7 admin routes incl. both new detail pages), E (operator management incl. both delete guards), Decision 8 (shared shell, bell, per-detail read marking) are each covered by a task.
- **Placeholder scan:** no TBD/TODO. Task 12 has no code (it's explicitly an operational step, documented as such, not a placeholder for missing implementation).
- **Type consistency:** `ConsultingRequestRow` (Task 6) matches the `consulting_requests` migration (Task 1) column-for-column. `OperatorListItem`/`OperatorRole` (Tasks 3, 10) are defined once and imported everywhere else. `AssessmentRow` (existing, extended with `listAssessments`/`getAssessmentsByIds` in Task 6) is reused as-is by both new admin assessment views — no parallel type was introduced.
- **Known test-pattern deviation, intentional:** Task 6's tests use `vi.doMock` + `vi.resetModules()` per test instead of this project's usual single top-level `vi.mock`, because `get-consulting-requests.ts` and the extended `get-assessment.ts` each export multiple functions whose Supabase call chains don't share a shape — a single static mock object can't serve `select().order()`, `select().eq().maybeSingle()`, `update().eq().is()`, and `select(...).is()` at once. Task 6 explicitly converts `get-assessment.test.ts`'s *existing* tests to the same pattern so the file stays internally consistent rather than mixing both mocking styles in one file.

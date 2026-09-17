# PBA 7-Layer Business Radar — Next.js Scaffold + Supabase Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Next.js project for `radar.ylia.io` with a working Supabase (Postgres + Storage) integration and a pure, unit-tested scoring engine, so later plans can build the question flow, radar chart UI, and PDF/email (Phase 2) on top of a proven foundation.

**Architecture:** Next.js App Router (TypeScript) at the project root. Scoring/level/bottleneck logic lives in pure, framework-free modules under `src/lib/scoring/` so it can be unit tested without a browser or a database. A single API route (`POST /api/assessments`) validates input with Zod, runs the scoring pipeline, and inserts the result into Supabase using a server-only `service_role` client — the client never computes or writes scores directly, closing the gap where a browser-side insert could let a visitor submit tampered scores. `supabase/migrations/0001_init.sql` (already applied by the user) defines the `assessments` / `consulting_requests` tables, RLS, and the `reports` storage bucket.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS 3, Zod, `@supabase/supabase-js`, Vitest.

**Spec:** `data/PBA_7Layer_business_radar_requirements.md` (see also `data/README_Claude_project_handoff.md`)

## Global Constraints

- Independent project: no BARA/도형심리 code, data, or branding may be mixed in (spec header).
- Score/diagnosis logic must be separated from UI and testable (spec section 0, rule 3; README recommended prompt).
- Interpretation copy/rules should live in config/data, not hardcoded in UI logic (spec section 0, rule 7) — this plan puts layer metadata in `src/lib/scoring/layers.config.ts`.
- Supabase `service_role` key must never reach the client bundle; only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` may be exposed to the browser (spec section 18, updated).
- `anon` key is insert-only via RLS; all reads/updates happen server-side with `service_role` (spec section 17, updated).
- Score calculation: `layer_score_100 = round(((raw_score - 4) / 16) * 100)` (spec section 8).
- Architecture Level bands: 120–140 SYSTEMIZED, 95–119 GROWTH_READY, 70–94 STRUCTURE_NEEDED, 40–69 FOUNDER_DEPENDENT, 28–39 IDEA_STAGE (spec section 9).
- Bottleneck tie-break order (ascending, worst first): PROCESS, CUSTOMER, VALUE, OFFER, EXPERIENCE, DATA & INTELLIGENCE, SCALE (spec section 10). Configurable, not hardcoded logic scattered across the codebase.
- Spec section 11 does not define a tie-break order for Strength Top 2. **Assumption made in this plan:** use the reverse of the bottleneck order (SCALE, DATA, EXPERIENCE, OFFER, VALUE, CUSTOMER, PROCESS) so a fully-tied assessment never reports the same layer as both a bottleneck and a strength. Flag this to the user for confirmation once the result UI is built.
- Out of scope for this plan (left for follow-up plans): the 28-question UI flow, Radar chart rendering, PDF generation, Resend email, GA4 events, consulting form UI.

---

### Task 1: Project scaffold (Next.js + TypeScript + Tailwind)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `.gitignore`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: a buildable Next.js app at the repo root, `npm test` running Vitest, `@/*` import alias resolving to `src/*` in both Next and Vitest.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "pba-7layer-business-radar",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.47.0",
    "zod": "^3.24.0",
    "server-only": "^0.0.1"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^3.4.15",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
```

- [ ] **Step 4: Create `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Create `postcss.config.mjs`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create `.gitignore`**

```text
node_modules
.next
.env
.env.local
.env.*.local
.vercel
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 7: Create `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: Create `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PBA 7-Layer Business Radar",
  description: "5분이면 현재 사업의 구조적 병목을 확인할 수 있습니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 9: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 10: Add a placeholder home page so the app builds**

Create `src/app/page.tsx` (replaced with the real landing page in Task 9):

```tsx
export default function HomePage() {
  return <main>PBA 7-Layer Business Radar</main>;
}
```

- [ ] **Step 11: Install dependencies**

Run: `npm install`
Expected: installs without errors, creates `package-lock.json`.

- [ ] **Step 12: Verify the app builds**

Run: `npm run build`
Expected: `Compiled successfully`, no type errors.

- [ ] **Step 13: Initialize git and commit**

The project has no git repository yet.

```bash
git init
git add package.json package-lock.json tsconfig.json next.config.mjs tailwind.config.ts postcss.config.mjs .gitignore vitest.config.ts src/app/layout.tsx src/app/globals.css src/app/page.tsx
git commit -m "chore: scaffold Next.js + TypeScript + Tailwind project"
```

---

### Task 2: Supabase clients (browser + server)

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/client.test.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/server.test.ts`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` env vars (already listed in `.env.example`).
- Produces: `createBrowserSupabaseClient(): SupabaseClient` and `createServiceRoleSupabaseClient(): SupabaseClient`, both used by Task 8's API route and by later UI/consulting-form work.

- [ ] **Step 1: Write the failing tests for the server client**

Create `src/lib/supabase/server.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { createServiceRoleSupabaseClient } from "./server";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createServiceRoleSupabaseClient", () => {
  it("throws when SUPABASE_SERVICE_ROLE_KEY is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    expect(() => createServiceRoleSupabaseClient()).toThrow(
      "Missing Supabase server environment variables"
    );
  });

  it("creates a client when both env vars are present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");

    expect(() => createServiceRoleSupabaseClient()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/supabase/server.test.ts`
Expected: FAIL — `Cannot find module './server'` (file doesn't exist yet).

- [ ] **Step 3: Implement `src/lib/supabase/server.ts`**

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createServiceRoleSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/supabase/server.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Write the failing tests for the browser client**

Create `src/lib/supabase/client.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { createBrowserSupabaseClient } from "./client";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createBrowserSupabaseClient", () => {
  it("throws when required env vars are missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    expect(() => createBrowserSupabaseClient()).toThrow(
      "Missing Supabase client environment variables"
    );
  });

  it("creates a client when both env vars are present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");

    expect(() => createBrowserSupabaseClient()).not.toThrow();
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npx vitest run src/lib/supabase/client.test.ts`
Expected: FAIL — `Cannot find module './client'`

- [ ] **Step 7: Implement `src/lib/supabase/client.ts`**

```ts
import { createClient } from "@supabase/supabase-js";

export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase client environment variables");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
```

- [ ] **Step 8: Run both test files to verify they pass**

Run: `npx vitest run src/lib/supabase`
Expected: PASS (4 tests)

- [ ] **Step 9: Commit**

```bash
git add src/lib/supabase
git commit -m "feat: add Supabase browser and server client factories"
```

---

### Task 3: Domain types and layer config

**Files:**
- Create: `src/lib/types/assessment.ts`
- Create: `src/lib/scoring/layers.config.ts`
- Create: `src/lib/scoring/layers.config.test.ts`

**Interfaces:**
- Produces: `LayerId` union type, `LAYER_IDS: LayerId[]`, `LayerAnswers`, `LayerScore`, `BasicInfo`, `ArchitectureLevel` types (consumed by Tasks 4–8); `LAYERS: LayerConfig[]` metadata (consumed by later UI/radar plans).

- [ ] **Step 1: Create `src/lib/types/assessment.ts`**

```ts
export type BusinessStage =
  | "idea"
  | "mvp_prep"
  | "building"
  | "operating"
  | "growth"
  | "realign";

export type ArchitectureLevel =
  | "IDEA_STAGE"
  | "FOUNDER_DEPENDENT"
  | "STRUCTURE_NEEDED"
  | "GROWTH_READY"
  | "SYSTEMIZED";

export type LayerId =
  | "value"
  | "customer"
  | "offer"
  | "experience"
  | "process"
  | "data"
  | "scale";

export const LAYER_IDS: LayerId[] = [
  "value",
  "customer",
  "offer",
  "experience",
  "process",
  "data",
  "scale",
];

export type LayerAnswerSet = [number, number, number, number];

export type LayerAnswers = Record<LayerId, LayerAnswerSet>;

export type LayerScore = {
  layerId: LayerId;
  raw: number;
  score100: number;
};

export type BasicInfo = {
  name: string;
  email: string;
  companyName?: string;
  role?: string;
  businessStage: BusinessStage;
  industry?: string;
  teamSize?: string;
};
```

- [ ] **Step 2: Create `src/lib/scoring/layers.config.ts`**

```ts
import type { LayerId } from "../types/assessment";

export type LayerConfig = {
  id: LayerId;
  name: string;
  shortName: string;
};

export const LAYERS: LayerConfig[] = [
  { id: "value", name: "VALUE", shortName: "Value" },
  { id: "customer", name: "CUSTOMER", shortName: "Customer" },
  { id: "offer", name: "OFFER", shortName: "Offer" },
  { id: "experience", name: "EXPERIENCE", shortName: "Experience" },
  { id: "process", name: "PROCESS", shortName: "Process" },
  { id: "data", name: "DATA & INTELLIGENCE", shortName: "Data" },
  { id: "scale", name: "SCALE", shortName: "Scale" },
];
```

- [ ] **Step 3: Write a sanity test**

Create `src/lib/scoring/layers.config.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { LAYER_IDS } from "../types/assessment";
import { LAYERS } from "./layers.config";

describe("LAYERS", () => {
  it("has exactly the 7 layers defined in the spec, in spec order", () => {
    expect(LAYERS.map((l) => l.id)).toEqual(LAYER_IDS);
  });
});
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/lib/scoring/layers.config.test.ts`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/lib/types src/lib/scoring/layers.config.ts src/lib/scoring/layers.config.test.ts
git commit -m "feat: add assessment domain types and layer config"
```

---

### Task 4: Scoring engine

**Files:**
- Create: `src/lib/scoring/scoring.ts`
- Create: `src/lib/scoring/scoring.test.ts`

**Interfaces:**
- Consumes: `LayerAnswers`, `LayerScore`, `LAYER_IDS` from `../types/assessment`.
- Produces: `scoreLayer(answers: LayerAnswerSet): { raw: number; score100: number }`, `scoreAllLayers(answers: LayerAnswers): LayerScore[]`, `totalRawScore(layerScores: LayerScore[]): number` — consumed by Task 7.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/scoring/scoring.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { LayerAnswers } from "../types/assessment";
import { scoreAllLayers, scoreLayer, totalRawScore } from "./scoring";

describe("scoreLayer", () => {
  it("computes raw and 0-100 score for the minimum (all 1s)", () => {
    expect(scoreLayer([1, 1, 1, 1])).toEqual({ raw: 4, score100: 0 });
  });

  it("computes raw and 0-100 score for the maximum (all 5s)", () => {
    expect(scoreLayer([5, 5, 5, 5])).toEqual({ raw: 20, score100: 100 });
  });

  it("computes raw and 0-100 score for the midpoint (all 3s)", () => {
    expect(scoreLayer([3, 3, 3, 3])).toEqual({ raw: 12, score100: 50 });
  });
});

function allLayers(answers: [number, number, number, number]): LayerAnswers {
  return {
    value: answers,
    customer: answers,
    offer: answers,
    experience: answers,
    process: answers,
    data: answers,
    scale: answers,
  };
}

describe("scoreAllLayers + totalRawScore", () => {
  it("spec section 26 Case 1: all answers 1 -> total 28, every layer 0/100", () => {
    const layerScores = scoreAllLayers(allLayers([1, 1, 1, 1]));
    expect(totalRawScore(layerScores)).toBe(28);
    expect(layerScores.every((l) => l.score100 === 0)).toBe(true);
  });

  it("spec section 26 Case 2: all answers 5 -> total 140, every layer 100/100", () => {
    const layerScores = scoreAllLayers(allLayers([5, 5, 5, 5]));
    expect(totalRawScore(layerScores)).toBe(140);
    expect(layerScores.every((l) => l.score100 === 100)).toBe(true);
  });

  it("spec section 26 Case 3: all answers 3 -> total 84, every layer 50/100", () => {
    const layerScores = scoreAllLayers(allLayers([3, 3, 3, 3]));
    expect(totalRawScore(layerScores)).toBe(84);
    expect(layerScores.every((l) => l.score100 === 50)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/scoring/scoring.test.ts`
Expected: FAIL — `Cannot find module './scoring'`

- [ ] **Step 3: Implement `src/lib/scoring/scoring.ts`**

```ts
import type { LayerAnswers, LayerAnswerSet, LayerScore } from "../types/assessment";
import { LAYER_IDS } from "../types/assessment";

export function scoreLayer(answers: LayerAnswerSet): {
  raw: number;
  score100: number;
} {
  const raw = answers.reduce((sum, answer) => sum + answer, 0);
  const score100 = Math.round(((raw - 4) / 16) * 100);
  return { raw, score100 };
}

export function scoreAllLayers(answers: LayerAnswers): LayerScore[] {
  return LAYER_IDS.map((layerId) => {
    const { raw, score100 } = scoreLayer(answers[layerId]);
    return { layerId, raw, score100 };
  });
}

export function totalRawScore(layerScores: LayerScore[]): number {
  return layerScores.reduce((sum, layerScore) => sum + layerScore.raw, 0);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/scoring/scoring.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring/scoring.ts src/lib/scoring/scoring.test.ts
git commit -m "feat: add layer scoring engine"
```

---

### Task 5: Architecture Level classifier

**Files:**
- Create: `src/lib/scoring/architecture-level.ts`
- Create: `src/lib/scoring/architecture-level.test.ts`

**Interfaces:**
- Consumes: `ArchitectureLevel` from `../types/assessment`.
- Produces: `classifyArchitectureLevel(totalRaw: number): ArchitectureLevel` — consumed by Task 7.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/scoring/architecture-level.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { classifyArchitectureLevel } from "./architecture-level";

describe("classifyArchitectureLevel", () => {
  it.each([
    [28, "IDEA_STAGE"],
    [39, "IDEA_STAGE"],
    [40, "FOUNDER_DEPENDENT"],
    [69, "FOUNDER_DEPENDENT"],
    [70, "STRUCTURE_NEEDED"],
    [94, "STRUCTURE_NEEDED"],
    [95, "GROWTH_READY"],
    [119, "GROWTH_READY"],
    [120, "SYSTEMIZED"],
    [140, "SYSTEMIZED"],
  ] as const)("classifies %i as %s (spec section 9 bands)", (totalRaw, expected) => {
    expect(classifyArchitectureLevel(totalRaw)).toBe(expected);
  });

  it("throws for totals outside the valid 28-140 range", () => {
    expect(() => classifyArchitectureLevel(27)).toThrow(RangeError);
    expect(() => classifyArchitectureLevel(141)).toThrow(RangeError);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/scoring/architecture-level.test.ts`
Expected: FAIL — `Cannot find module './architecture-level'`

- [ ] **Step 3: Implement `src/lib/scoring/architecture-level.ts`**

```ts
import type { ArchitectureLevel } from "../types/assessment";

export function classifyArchitectureLevel(totalRaw: number): ArchitectureLevel {
  if (totalRaw < 28 || totalRaw > 140) {
    throw new RangeError(`totalRaw must be between 28 and 140, got ${totalRaw}`);
  }
  if (totalRaw >= 120) return "SYSTEMIZED";
  if (totalRaw >= 95) return "GROWTH_READY";
  if (totalRaw >= 70) return "STRUCTURE_NEEDED";
  if (totalRaw >= 40) return "FOUNDER_DEPENDENT";
  return "IDEA_STAGE";
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/scoring/architecture-level.test.ts`
Expected: PASS (11 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring/architecture-level.ts src/lib/scoring/architecture-level.test.ts
git commit -m "feat: add architecture level classifier"
```

---

### Task 6: Bottleneck / Strength engine

**Files:**
- Create: `src/lib/scoring/bottleneck.ts`
- Create: `src/lib/scoring/bottleneck.test.ts`

**Interfaces:**
- Consumes: `LayerId`, `LayerScore` from `../types/assessment`.
- Produces: `BOTTLENECK_TIE_BREAK_ORDER: LayerId[]`, `STRENGTH_TIE_BREAK_ORDER: LayerId[]`, `findBottlenecks(layerScores: LayerScore[], count?: number): LayerId[]`, `findStrengths(layerScores: LayerScore[], count?: number): LayerId[]` — consumed by Task 7.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/scoring/bottleneck.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { LayerId, LayerScore } from "../types/assessment";
import { findBottlenecks, findStrengths } from "./bottleneck";

function score(layerId: LayerId, score100: number): LayerScore {
  return { layerId, raw: 4 + Math.round((score100 / 100) * 16), score100 };
}

describe("findBottlenecks", () => {
  it("spec section 26 Case 4: lowest 3 of PROCESS/DATA/SCALE are picked", () => {
    const layerScores: LayerScore[] = [
      score("value", 80),
      score("customer", 80),
      score("offer", 80),
      score("experience", 80),
      score("process", 10),
      score("data", 20),
      score("scale", 30),
    ];

    expect(findBottlenecks(layerScores)).toEqual(["process", "data", "scale"]);
  });

  it("breaks ties using the spec section 10 priority order", () => {
    const allTied = [
      score("value", 50),
      score("customer", 50),
      score("offer", 50),
      score("experience", 50),
      score("process", 50),
      score("data", 50),
      score("scale", 50),
    ];

    expect(findBottlenecks(allTied)).toEqual(["process", "customer", "value"]);
  });
});

describe("findStrengths", () => {
  it("picks the top 2 by score100", () => {
    const layerScores: LayerScore[] = [
      score("value", 90),
      score("customer", 40),
      score("offer", 85),
      score("experience", 30),
      score("process", 20),
      score("data", 10),
      score("scale", 5),
    ];

    expect(findStrengths(layerScores)).toEqual(["value", "offer"]);
  });

  it("breaks ties without ever overlapping the bottleneck tie-break winners", () => {
    const allTied = [
      score("value", 50),
      score("customer", 50),
      score("offer", 50),
      score("experience", 50),
      score("process", 50),
      score("data", 50),
      score("scale", 50),
    ];

    const bottlenecks = findBottlenecks(allTied);
    const strengths = findStrengths(allTied);

    expect(strengths).toEqual(["scale", "data"]);
    expect(strengths.some((id) => bottlenecks.includes(id))).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/scoring/bottleneck.test.ts`
Expected: FAIL — `Cannot find module './bottleneck'`

- [ ] **Step 3: Implement `src/lib/scoring/bottleneck.ts`**

```ts
import type { LayerId, LayerScore } from "../types/assessment";

// Worst-first tie-break priority per spec section 10.
export const BOTTLENECK_TIE_BREAK_ORDER: LayerId[] = [
  "process",
  "customer",
  "value",
  "offer",
  "experience",
  "data",
  "scale",
];

// Spec section 11 does not define a strength tie-break order. We use the
// reverse of the bottleneck order (best-first) so a fully-tied assessment
// never reports the same layer as both a bottleneck and a strength.
export const STRENGTH_TIE_BREAK_ORDER: LayerId[] = [
  ...BOTTLENECK_TIE_BREAK_ORDER,
].reverse();

function sortWithPriority(
  layerScores: LayerScore[],
  direction: "asc" | "desc",
  tieBreakOrder: LayerId[]
): LayerScore[] {
  const priorityIndex = new Map(tieBreakOrder.map((id, index) => [id, index]));
  return [...layerScores].sort((a, b) => {
    const diff =
      direction === "asc" ? a.score100 - b.score100 : b.score100 - a.score100;
    if (diff !== 0) return diff;
    return priorityIndex.get(a.layerId)! - priorityIndex.get(b.layerId)!;
  });
}

export function findBottlenecks(layerScores: LayerScore[], count = 3): LayerId[] {
  return sortWithPriority(layerScores, "asc", BOTTLENECK_TIE_BREAK_ORDER)
    .slice(0, count)
    .map((l) => l.layerId);
}

export function findStrengths(layerScores: LayerScore[], count = 2): LayerId[] {
  return sortWithPriority(layerScores, "desc", STRENGTH_TIE_BREAK_ORDER)
    .slice(0, count)
    .map((l) => l.layerId);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/scoring/bottleneck.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring/bottleneck.ts src/lib/scoring/bottleneck.test.ts
git commit -m "feat: add bottleneck/strength ranking engine"
```

---

### Task 7: Assessment computation pipeline + input schema

**Files:**
- Create: `src/lib/scoring/submit-assessment.schema.ts`
- Create: `src/lib/scoring/submit-assessment.ts`
- Create: `src/lib/scoring/submit-assessment.test.ts`

**Interfaces:**
- Consumes: `scoreAllLayers`, `totalRawScore` (Task 4), `classifyArchitectureLevel` (Task 5), `findBottlenecks`, `findStrengths` (Task 6), `BasicInfo`, `LayerAnswers`, `LayerId`, `ArchitectureLevel` (Task 3).
- Produces: `submitAssessmentSchema: ZodSchema`, `SubmitAssessmentPayload` type, `computeAssessmentResult(input): AssessmentComputation` where `AssessmentComputation = { row: AssessmentInsertRow; architectureLevel; totalRaw; bottlenecks; strengths }` — consumed by Task 8's API route. `AssessmentInsertRow` matches the `assessments` table columns from `supabase/migrations/0001_init.sql` (minus `id`/`created_at`, which the database generates).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/scoring/submit-assessment.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { SubmitAssessmentInput } from "./submit-assessment";
import { computeAssessmentResult } from "./submit-assessment";
import { submitAssessmentSchema } from "./submit-assessment.schema";

function allOnesInput(): SubmitAssessmentInput {
  return {
    basicInfo: {
      name: "테스트 사용자",
      email: "test@example.com",
      businessStage: "idea",
    },
    answers: {
      value: [1, 1, 1, 1],
      customer: [1, 1, 1, 1],
      offer: [1, 1, 1, 1],
      experience: [1, 1, 1, 1],
      process: [1, 1, 1, 1],
      data: [1, 1, 1, 1],
      scale: [1, 1, 1, 1],
    },
    marketingConsent: false,
  };
}

describe("computeAssessmentResult", () => {
  it("spec section 26 Case 1: all 1s -> total 28, IDEA_STAGE", () => {
    const result = computeAssessmentResult(allOnesInput());

    expect(result.totalRaw).toBe(28);
    expect(result.architectureLevel).toBe("IDEA_STAGE");
    expect(result.row.total_raw).toBe(28);
    expect(result.row.architecture_level).toBe("IDEA_STAGE");
    expect(result.row.score_value_raw).toBe(4);
    expect(result.row.score_value_100).toBe(0);
    expect(result.row.name).toBe("테스트 사용자");
    expect(result.row.business_stage).toBe("idea");
    expect(result.row.consulting_cta_clicked).toBe(false);
    expect(result.row.consulting_requested).toBe(false);
  });

  it("carries optional basic info fields through as null when omitted", () => {
    const result = computeAssessmentResult(allOnesInput());

    expect(result.row.company_name).toBeNull();
    expect(result.row.role).toBeNull();
    expect(result.row.industry).toBeNull();
    expect(result.row.team_size).toBeNull();
    expect(result.row.utm_source).toBeNull();
  });
});

describe("submitAssessmentSchema", () => {
  it("accepts a valid payload", () => {
    const parsed = submitAssessmentSchema.safeParse(allOnesInput());
    expect(parsed.success).toBe(true);
  });

  it("rejects an answer outside the 1-5 range", () => {
    const invalid = allOnesInput();
    invalid.answers.value = [6, 1, 1, 1];

    const parsed = submitAssessmentSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const invalid = allOnesInput();
    invalid.basicInfo.email = "not-an-email";

    const parsed = submitAssessmentSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/scoring/submit-assessment.test.ts`
Expected: FAIL — `Cannot find module './submit-assessment'`

- [ ] **Step 3: Implement `src/lib/scoring/submit-assessment.schema.ts`**

```ts
import { z } from "zod";

const answerScore = z.number().int().min(1).max(5);
const layerAnswers = z.tuple([answerScore, answerScore, answerScore, answerScore]);

export const businessStageSchema = z.enum([
  "idea",
  "mvp_prep",
  "building",
  "operating",
  "growth",
  "realign",
]);

export const submitAssessmentSchema = z.object({
  basicInfo: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    companyName: z.string().optional(),
    role: z.string().optional(),
    businessStage: businessStageSchema,
    industry: z.string().optional(),
    teamSize: z.string().optional(),
  }),
  answers: z.object({
    value: layerAnswers,
    customer: layerAnswers,
    offer: layerAnswers,
    experience: layerAnswers,
    process: layerAnswers,
    data: layerAnswers,
    scale: layerAnswers,
  }),
  marketingConsent: z.boolean(),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
    })
    .optional(),
});

export type SubmitAssessmentPayload = z.infer<typeof submitAssessmentSchema>;
```

- [ ] **Step 4: Implement `src/lib/scoring/submit-assessment.ts`**

```ts
import type {
  ArchitectureLevel,
  BasicInfo,
  LayerAnswers,
  LayerId,
} from "../types/assessment";
import { findBottlenecks, findStrengths } from "./bottleneck";
import { classifyArchitectureLevel } from "./architecture-level";
import { scoreAllLayers, totalRawScore } from "./scoring";

export type SubmitAssessmentInput = {
  basicInfo: BasicInfo;
  answers: LayerAnswers;
  marketingConsent: boolean;
  utm?: { source?: string; medium?: string; campaign?: string };
};

export type AssessmentInsertRow = {
  name: string;
  email: string;
  company_name: string | null;
  role: string | null;
  business_stage: BasicInfo["businessStage"];
  industry: string | null;
  team_size: string | null;
  score_value_raw: number;
  score_value_100: number;
  score_customer_raw: number;
  score_customer_100: number;
  score_offer_raw: number;
  score_offer_100: number;
  score_experience_raw: number;
  score_experience_100: number;
  score_process_raw: number;
  score_process_100: number;
  score_data_raw: number;
  score_data_100: number;
  score_scale_raw: number;
  score_scale_100: number;
  total_raw: number;
  architecture_level: ArchitectureLevel;
  bottleneck_1: LayerId;
  bottleneck_2: LayerId;
  bottleneck_3: LayerId;
  strength_1: LayerId;
  strength_2: LayerId;
  consulting_cta_clicked: boolean;
  consulting_requested: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  marketing_consent: boolean;
};

export type AssessmentComputation = {
  row: AssessmentInsertRow;
  architectureLevel: ArchitectureLevel;
  totalRaw: number;
  bottlenecks: LayerId[];
  strengths: LayerId[];
};

export function computeAssessmentResult(
  input: SubmitAssessmentInput
): AssessmentComputation {
  const layerScores = scoreAllLayers(input.answers);
  const totalRaw = totalRawScore(layerScores);
  const architectureLevel = classifyArchitectureLevel(totalRaw);
  const bottlenecks = findBottlenecks(layerScores);
  const strengths = findStrengths(layerScores);

  const scoreByLayer = new Map(layerScores.map((l) => [l.layerId, l]));
  const get = (layerId: LayerId) => scoreByLayer.get(layerId)!;

  const row: AssessmentInsertRow = {
    name: input.basicInfo.name,
    email: input.basicInfo.email,
    company_name: input.basicInfo.companyName ?? null,
    role: input.basicInfo.role ?? null,
    business_stage: input.basicInfo.businessStage,
    industry: input.basicInfo.industry ?? null,
    team_size: input.basicInfo.teamSize ?? null,
    score_value_raw: get("value").raw,
    score_value_100: get("value").score100,
    score_customer_raw: get("customer").raw,
    score_customer_100: get("customer").score100,
    score_offer_raw: get("offer").raw,
    score_offer_100: get("offer").score100,
    score_experience_raw: get("experience").raw,
    score_experience_100: get("experience").score100,
    score_process_raw: get("process").raw,
    score_process_100: get("process").score100,
    score_data_raw: get("data").raw,
    score_data_100: get("data").score100,
    score_scale_raw: get("scale").raw,
    score_scale_100: get("scale").score100,
    total_raw: totalRaw,
    architecture_level: architectureLevel,
    bottleneck_1: bottlenecks[0],
    bottleneck_2: bottlenecks[1],
    bottleneck_3: bottlenecks[2],
    strength_1: strengths[0],
    strength_2: strengths[1],
    consulting_cta_clicked: false,
    consulting_requested: false,
    utm_source: input.utm?.source ?? null,
    utm_medium: input.utm?.medium ?? null,
    utm_campaign: input.utm?.campaign ?? null,
    marketing_consent: input.marketingConsent,
  };

  return { row, architectureLevel, totalRaw, bottlenecks, strengths };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/lib/scoring/submit-assessment.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add src/lib/scoring/submit-assessment.schema.ts src/lib/scoring/submit-assessment.ts src/lib/scoring/submit-assessment.test.ts
git commit -m "feat: add assessment computation pipeline and input schema"
```

---

### Task 8: `POST /api/assessments` route

**Files:**
- Create: `src/app/api/assessments/route.ts`
- Create: `src/app/api/assessments/route.test.ts`

**Interfaces:**
- Consumes: `submitAssessmentSchema` (Task 7), `computeAssessmentResult` (Task 7), `createServiceRoleSupabaseClient` (Task 2).
- Produces: `POST` handler at `/api/assessments` returning `201 { assessmentId, architectureLevel, totalRaw, bottlenecks, strengths }` on success, `400 { error }` on validation failure, `500 { error }` on database failure.

- [ ] **Step 1: Write the failing tests**

Create `src/app/api/assessments/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const single = vi.fn();
const select = vi.fn(() => ({ single }));
const insert = vi.fn(() => ({ select }));
const from = vi.fn(() => ({ insert }));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

function validPayload() {
  return {
    basicInfo: {
      name: "테스트 사용자",
      email: "test@example.com",
      businessStage: "idea",
    },
    answers: {
      value: [1, 1, 1, 1],
      customer: [1, 1, 1, 1],
      offer: [1, 1, 1, 1],
      experience: [1, 1, 1, 1],
      process: [1, 1, 1, 1],
      data: [1, 1, 1, 1],
      scale: [1, 1, 1, 1],
    },
    marketingConsent: false,
  };
}

beforeEach(() => {
  single.mockReset();
  select.mockClear();
  insert.mockClear();
  from.mockClear();
});

describe("POST /api/assessments", () => {
  it("computes scores and inserts a row, returning 201", async () => {
    single.mockResolvedValueOnce({ data: { id: "test-id" }, error: null });
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/assessments", {
      method: "POST",
      body: JSON.stringify(validPayload()),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.assessmentId).toBe("test-id");
    expect(json.architectureLevel).toBe("IDEA_STAGE");
    expect(json.totalRaw).toBe(28);
    expect(from).toHaveBeenCalledWith("assessments");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ total_raw: 28, architecture_level: "IDEA_STAGE" })
    );
  });

  it("returns 400 for an invalid payload without touching Supabase", async () => {
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/assessments", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 500 when the insert fails", async () => {
    single.mockResolvedValueOnce({
      data: null,
      error: { message: "insert failed" },
    });
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/assessments", {
      method: "POST",
      body: JSON.stringify(validPayload()),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe("insert failed");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/app/api/assessments/route.test.ts`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 3: Implement `src/app/api/assessments/route.ts`**

```ts
import { NextResponse } from "next/server";
import { computeAssessmentResult } from "@/lib/scoring/submit-assessment";
import { submitAssessmentSchema } from "@/lib/scoring/submit-assessment.schema";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = submitAssessmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { row, architectureLevel, totalRaw, bottlenecks, strengths } =
    computeAssessmentResult(parsed.data);

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("assessments")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { assessmentId: data.id, architectureLevel, totalRaw, bottlenecks, strengths },
    { status: 201 }
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/app/api/assessments/route.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Run the full test suite and typecheck**

Run: `npm test && npm run typecheck`
Expected: all tests PASS, no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/assessments
git commit -m "feat: add POST /api/assessments route"
```

---

### Task 9: Landing page

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: nothing (static content from spec section 5.1).
- Produces: the real landing page, replacing Task 1's placeholder. Links to `/diagnose`, which is out of scope for this plan and will 404 until a follow-up plan builds the question flow.

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        PBA 7-Layer Business Radar
      </p>
      <h1 className="text-3xl font-bold sm:text-4xl">
        사업이 막힐 때, 기능보다 구조부터 봅니다.
      </h1>
      <p className="text-lg text-slate-600">
        5분이면 현재 사업의 구조적 병목을 확인할 수 있습니다.
      </p>
      <a
        href="/diagnose"
        className="rounded-full bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-700"
      >
        무료 Business Radar 시작하기
      </a>
      <ul className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
        <li>28문항</li>
        <li>약 5분</li>
        <li>7개 구조 영역</li>
        <li>결과 즉시 확인</li>
      </ul>
    </main>
  );
}
```

- [ ] **Step 2: Verify the app still builds**

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add spec section 5.1 landing page"
```

---

### Task 10: Local setup docs + manual Supabase verification

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: `data/PBA_7Layer_business_radar_requirements.md` section 28 item 8 ("로컬 실행 방법") deliverable.

- [ ] **Step 1: Create `README.md`**

```md
# PBA 7-Layer Business Radar

Independent MVP for `radar.ylia.io`. See `data/PBA_7Layer_business_radar_requirements.md`
for the full spec. Completely separate from the BARA/도형심리 project — do not
mix code, data, or branding between the two.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase project's
   URL and keys (Project Settings → API in the Supabase dashboard):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only — never commit this or expose
     it to the client)
3. The database schema (`assessments`, `consulting_requests`, RLS policies,
   the `reports` storage bucket) lives in `supabase/migrations/0001_init.sql`.

## Commands

- `npm run dev` — start the dev server at http://localhost:3000
- `npm run build` — production build
- `npm test` — run the Vitest suite (scoring engine + API route)
- `npm run typecheck` — TypeScript check with no emit

## Manually verifying the Supabase write path

With `.env.local` filled in and `npm run dev` running:

\`\`\`bash
curl -X POST http://localhost:3000/api/assessments \
  -H "Content-Type: application/json" \
  -d '{
    "basicInfo": { "name": "테스트", "email": "test@example.com", "businessStage": "idea" },
    "answers": {
      "value": [1,1,1,1], "customer": [1,1,1,1], "offer": [1,1,1,1],
      "experience": [1,1,1,1], "process": [1,1,1,1], "data": [1,1,1,1], "scale": [1,1,1,1]
    },
    "marketingConsent": false
  }'
\`\`\`

Expected: `201` response with `"architectureLevel": "IDEA_STAGE"` and a new row
visible in the `assessments` table in Supabase Studio.

## Scope of this codebase so far

Implemented: project scaffold, Supabase client wiring, the scoring/level/
bottleneck engine, and the `assessments` write path. **Not yet implemented**
(future plans): the 28-question UI flow, the `/diagnose` route, the Radar
chart, PDF generation, Resend email, GA4 events, and the consulting form.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add local setup and Supabase verification instructions"
```

- [ ] **Step 3: Manual verification (not automatable without live credentials)**

Ask the user to:
1. Fill in `.env.local` with their real Supabase project's URL and keys (the project where `0001_init.sql` was already applied).
2. Run `npm run dev` and execute the `curl` command from `README.md`.
3. Confirm a new row appears in the `assessments` table via Supabase Studio's Table Editor.
4. Confirm that querying the `assessments` table with the `anon` key (e.g. from the Supabase JS client with only `NEXT_PUBLIC_SUPABASE_ANON_KEY`) returns zero rows — proving the RLS insert-only policy is actually enforced.

---

## Self-Review Notes

- **Spec coverage:** sections 8 (scoring), 9 (levels), 10–11 (bottleneck/strength), 16–18/22 (Supabase architecture, updated from the original Google-based text), 25 Phase 1 "Supabase 저장" item, and 28 item 8 ("로컬 실행 방법") are all covered. Sections covering the question UI, Radar chart, PDF/email, GA4, and consulting form are explicitly deferred to follow-up plans (see Global Constraints).
- **Placeholder scan:** no TBD/TODO markers; the one intentionally unresolved link (`/diagnose`) is a real future route, not a stand-in for missing logic.
- **Type consistency:** `AssessmentInsertRow` (Task 7) field names match the column names in `supabase/migrations/0001_init.sql` exactly; `LayerId`/`ArchitectureLevel`/`BusinessStage` are defined once in `src/lib/types/assessment.ts` and imported everywhere else rather than redeclared.

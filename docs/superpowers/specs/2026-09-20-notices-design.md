# Notices (공지사항) Design

**Status:** Approved for planning
**Builds on:** the admin shell (`src/app/admin/(dashboard)/layout.tsx`), shared `Modal`/`ConfirmDialog`/`ChipGroup`, the public header/footer, and the Supabase service-role access pattern as of commit `487c2f6`
**Blocks:** the Phase B privacy policy revision (`docs/superpowers/specs/2026-09-19-result-enrichment-design.md` §B5), which needs somewhere to publish its 7-day advance notice

## Goal

Let an operator write, publish and manage announcements in the admin, and show them to visitors: a list and detail page, a footer link, and a dismissible banner for the ones that matter.

## Decisions Made During Brainstorming

1. **A general notice board**, not a one-off "policy revised" line — the privacy revision is simply its first entry.
2. **Public placement: footer link + an important-notice banner.** No landing-page feed; the diagnosis start flow stays clean.
3. **Publish/hide plus an important-until date.** No scheduled publishing. When the important window ends, the banner disappears and the notice stays in the list.
4. **Rich text via a Tiptap editor** in the admin (the user asked for an editor rather than plain text), with **images uploaded to Supabase Storage**.
5. **Because the body is HTML, sanitizing on the server is part of the feature, not an extra** — see section D.
6. **Any operator (owner or staff) can manage notices**, and every notice records who created and last updated it. Same stance as retention control in the result-enrichment design.
7. **Migration numbering:** notices ship first and take `0010_notices.sql`; the result-enrichment migration becomes `0011`, the i18n locale migration `0012`.
8. **Korean copy only.** When i18n lands, notice bodies stay in whatever language they were written — they are operator content, not UI strings.

## A. Data (migration `0010_notices.sql`)

```sql
create table notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body_html text not null,          -- sanitized server-side before it is stored
  is_published boolean not null default false,
  published_at timestamptz,          -- set the first time is_published flips true
  is_important boolean not null default false,
  important_until date,              -- banner shows while >= today; null = no banner
  created_by text not null,          -- operator email
  updated_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notices_published_idx on notices (is_published, published_at desc);

alter table notices enable row level security;
-- No anon/authenticated policies: all access goes through server routes using
-- the service role, same as assessments and consulting_requests.
```

Storage: a `notice-images` bucket, public read, service-role write.

## B. Admin

Nav item "공지사항" in the admin sidebar, between "전체 진단" and "운영자 관리".

- **`/admin/notices`** — table: 제목, 게시(게시중/숨김), 중요(중요 표시 종료일), 작성일, 수정자, and a 보기 link. A "새 공지 작성" button.
- **`/admin/notices/new`** and **`/admin/notices/[noticeId]`** — the same form component: 제목 input, the editor, a 게시 여부 toggle, a 중요 여부 toggle with a 중요 표시 종료일 date input (required when important), 저장, and on the edit page 삭제 (centered `ConfirmDialog`).
- The edit page shows created/updated by and when.
- Deleting a notice does not delete its uploaded images; unused images are left in the bucket (acceptable for the volume here — noted, not solved).

**Editor (Tiptap):** StarterKit trimmed to paragraph, bold, italic, bullet/ordered list, blockquote, and H2/H3, plus Link and Image extensions. Toolbar buttons for exactly those. It is a client component; the page passes the initial HTML in and receives HTML out on save.

**Image upload:** `POST /api/admin/notices/images` (multipart) → verifies the caller with `getCurrentOperator()`, checks the magic bytes are png/jpeg/webp/gif and the size is ≤ 5 MB, uploads to `notice-images/<uuid>.<ext>` with the service role, returns `{ url }` (the bucket's public URL). The editor inserts that URL.

## C. Public

- **`/notice`** — published notices, newest first: title, date, and a one-line text excerpt derived from the body (HTML stripped, 120 chars). Empty state: "등록된 공지사항이 없습니다."
- **`/notice/[noticeId]`** — title, date, body. Unpublished or unknown → `notFound()`.
- **Footer**: a "공지사항" link next to 개인정보처리방침.
- **Banner** (`NoticeBanner`, server component rendered in the public layout under `SiteHeader`): the most recently published notice where `is_published` and `is_important` and `important_until >= today` (KST). Shows the title, links to its detail page, and has a dismiss button. Dismissal stores the notice id in `localStorage` (per browser, per notice) — wrapped in try/catch so private mode can't break rendering. `print:hidden`, and never rendered under `/admin`.

## D. Sanitizing (the security-critical part)

An editor produces HTML; storing and rendering it unfiltered would let anything an operator pastes — or anything injected into a paste — run in every visitor's browser.

`src/lib/notices/sanitize-notice-html.ts` runs **on the server, on save** (not only on render), so what's stored is already safe:

- Allowed tags: `p`, `br`, `strong`, `em`, `h2`, `h3`, `ul`, `ol`, `li`, `a`, `blockquote`, `img`.
- Allowed attributes: `a[href]`, `img[src|alt]`. Everything else — including every `on*` handler, `style`, `class`, `id` — is dropped.
- `a` href schemes: `http`, `https`, `mailto` only (`javascript:` and `data:` dropped). Rendered links get `target="_blank" rel="noopener noreferrer"`.
- `img` src must start with the project's Supabase storage public prefix; any other image is removed entirely, so no external host can log visitor IPs or serve a tracking pixel.
- Implemented with `sanitize-html` (allowlist-based), not a hand-rolled regex.

Rendering uses `dangerouslySetInnerHTML` with the stored, already-sanitized HTML.

## E. Dependencies (new)

`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image` (admin-only, client), `sanitize-html` + `@types/sanitize-html` (server). Image type checking reads magic bytes directly — no library.

## F. Testing

- **Unit — `sanitizeNoticeHtml`:** `<script>` removed; `onerror`/`onclick` attributes removed; `javascript:` and `data:` hrefs dropped while `https:`/`mailto:` survive; an `img` from an external host removed but one from the storage prefix kept; allowed formatting tags survive; `target`/`rel` added to links.
- **Unit — banner selection (`selectBannerNotice`)**: returns null when nothing is published, when the only candidate isn't important, and when `important_until` is in the past; returns the newest candidate when several qualify.
- **Unit — excerpt:** HTML stripped, length capped, no broken entity.
- **API:** notices CRUD and the image upload reject an unauthenticated caller (401/403); invalid payloads 400; upload rejects >5 MB and a non-image whose extension lies; a notice saved with `<script>` in the body comes back sanitized from the database.
- **Manual (dev server):** write a notice with a heading, list, link and uploaded image → save as hidden → confirm it is absent from `/notice` → publish → confirm list, detail, and banner → dismiss the banner and confirm it stays dismissed on reload but the notice is still in the list → set `important_until` to yesterday and confirm only the banner disappears → delete it and confirm both pages 404/empty → confirm `/admin` shows no banner and print output excludes it.

## Explicitly Out of Scope

- Scheduled publishing (publish-at), draft revisions, and edit history beyond `updated_by`/`updated_at`.
- Cleaning up images left behind by deleted notices.
- Email or push notification of new notices.
- Categories, tags, pinning multiple banners, pagination (fewer notices than a page for the foreseeable future).
- Translating notice bodies.

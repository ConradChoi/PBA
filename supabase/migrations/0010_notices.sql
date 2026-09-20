-- Operator-written announcements shown at /notice and, while important, in a
-- banner on every public page. Body HTML is sanitized server-side before it
-- is stored, so anything read back is already safe to render.
create table notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body_html text not null,
  is_published boolean not null default false,
  published_at timestamptz,
  is_important boolean not null default false,
  important_until date,
  created_by text not null,
  updated_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notices_published_idx on notices (is_published, published_at desc);

alter table notices enable row level security;
-- No anon/authenticated policies: all access goes through server routes using
-- the service role, same as assessments and consulting_requests.

-- Images embedded in notice bodies. Public read so the <img> works for every
-- visitor; writes happen server-side with the service role.
insert into storage.buckets (id, name, public)
values ('notice-images', 'notice-images', true)
on conflict (id) do nothing;

create policy "service role manage notice images"
  on storage.objects for all
  to service_role
  using (bucket_id = 'notice-images')
  with check (bucket_id = 'notice-images');

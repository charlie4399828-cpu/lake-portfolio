-- Lake 作品集 CMS 云端数据表（单行 JSON，公开可读；写入仅允许 save-lake-site Edge Function）
create table if not exists public.lake_content (
  id int primary key default 1,
  content jsonb not null default '{}'::jsonb,
  edit_password text not null default '',
  updated_at timestamptz not null default now(),
  constraint lake_content_single_row check (id = 1)
);

alter table public.lake_content enable row level security;

drop policy if exists lake_content_public_read on public.lake_content;
create policy "lake_content_public_read"
  on public.lake_content for select
  to anon, authenticated
  using (true);

revoke insert, update, delete on public.lake_content from anon, authenticated;

insert into public.lake_content (id, content, edit_password)
values (1, '{}'::jsonb, '')
on conflict (id) do nothing;

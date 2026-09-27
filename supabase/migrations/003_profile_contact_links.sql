-- Adds optional public contact links to profiles.

alter table public.profiles
  add column if not exists email text not null default '',
  add column if not exists linkedin_url text not null default '',
  add column if not exists website_url text not null default '';

-- Adds an optional featured flag for portfolio projects.

alter table public.projects
  add column if not exists featured boolean not null default false;

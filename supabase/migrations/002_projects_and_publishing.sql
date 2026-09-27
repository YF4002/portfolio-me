-- Safe to run against a database that already has the Phase 2 tables.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  external_id text not null,
  title text not null,
  description text not null default '',
  project_url text not null,
  image_url text,
  language text,
  stars integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_external_unique'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_external_unique unique (portfolio_id, external_id);
  end if;
end
$$;

alter table public.projects enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'projects'
      and policyname = 'Users can manage portfolio projects'
  ) then
    create policy "Users can manage portfolio projects"
      on public.projects for all using (
        exists (
          select 1 from public.portfolios
          where portfolios.id = projects.portfolio_id
            and portfolios.user_id = auth.uid()
        )
      ) with check (
        exists (
          select 1 from public.portfolios
          where portfolios.id = projects.portfolio_id
            and portfolios.user_id = auth.uid()
        )
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'portfolios'
      and policyname = 'Anyone can view published portfolios'
  ) then
    create policy "Anyone can view published portfolios"
      on public.portfolios for select using (status = 'published');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Anyone can view published portfolio profiles'
  ) then
    create policy "Anyone can view published portfolio profiles"
      on public.profiles for select using (
        exists (
          select 1 from public.portfolios
          where portfolios.user_id = profiles.id
            and portfolios.status = 'published'
        )
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'projects'
      and policyname = 'Anyone can view visible published projects'
  ) then
    create policy "Anyone can view visible published projects"
      on public.projects for select using (
        visible = true and exists (
          select 1 from public.portfolios
          where portfolios.id = projects.portfolio_id
            and portfolios.status = 'published'
        )
      );
  end if;
end
$$;

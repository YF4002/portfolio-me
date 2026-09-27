create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default '',
  email text not null default '',
  linkedin_url text not null default '',
  website_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null default '',
  bio text not null default '',
  theme text not null default 'intent',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  provider text not null,
  profile_url text not null,
  status text not null default 'pending' check (status in ('pending', 'importing', 'ready', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.sources add constraint sources_portfolio_url_unique unique (portfolio_id, profile_url);

create table public.projects (
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
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.projects add constraint projects_external_unique unique (portfolio_id, external_id);

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.sources enable row level security;
alter table public.projects enable row level security;

create policy "Users can manage their profile"
  on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can manage their portfolios"
  on public.portfolios for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage portfolio sources"
  on public.sources for all using (
    exists (
      select 1 from public.portfolios
      where portfolios.id = sources.portfolio_id and portfolios.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.portfolios
      where portfolios.id = sources.portfolio_id and portfolios.user_id = auth.uid()
    )
  );

create policy "Users can manage portfolio projects"
  on public.projects for all using (
    exists (
      select 1 from public.portfolios
      where portfolios.id = projects.portfolio_id and portfolios.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.portfolios
      where portfolios.id = projects.portfolio_id and portfolios.user_id = auth.uid()
    )
  );

create policy "Anyone can view published portfolios"
  on public.portfolios for select using (status = 'published');

create policy "Anyone can view published portfolio profiles"
  on public.profiles for select using (
    exists (
      select 1 from public.portfolios
      where portfolios.user_id = profiles.id and portfolios.status = 'published'
    )
  );

create policy "Anyone can view visible published projects"
  on public.projects for select using (
    visible = true and exists (
      select 1 from public.portfolios
      where portfolios.id = projects.portfolio_id and portfolios.status = 'published'
    )
  );

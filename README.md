# Portfolio Me

Portfolio Me is a Next.js and TypeScript foundation for turning a creator's existing online work into a polished portfolio.

## Local development

```bash
npm install
npm run dev
```

The first product surface is the marketing page and interactive first-draft preview. Future work can add authentication, provider connections, background imports, and a persisted portfolio editor without changing the public page architecture.

## Supabase setup

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase publishable `anon` key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. For a new Supabase project, run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL Editor.
4. For the existing project after the initial schema has already run, run [`002_projects_and_publishing.sql`](./supabase/migrations/002_projects_and_publishing.sql) instead.
5. Start the app with `npm run dev`.

Onboarding drafts are persisted to `profiles`, `portfolios`, and (when provided) `sources` after the user signs in. The local draft is retained until the database write succeeds.

## GitHub import

The editor accepts a public GitHub profile or repository URL. It previews public, non-forked repositories through `/api/github/preview`; users review the results before approved projects are written to the `projects` table. Private repositories and authenticated GitHub access will be added after the public import flow is validated.

## Publishing

After saving a profile and approving projects, use **Publish portfolio** in the editor. Published portfolios are available at `/p/[slug]`. The public route only reads portfolios with `status = 'published'`, visible projects, and profiles linked to a published portfolio. The migration file is safe to run more than once.

The editor also supports optional public contact details: email, LinkedIn, and personal website. Apply [`003_profile_contact_links.sql`](./supabase/migrations/003_profile_contact_links.sql) to an existing database before saving these fields.

You can also mark imported projects as featured. Apply [`004_featured_projects.sql`](./supabase/migrations/004_featured_projects.sql) to an existing database before using the feature. Featured projects appear first on the public portfolio.
# portfolio-me

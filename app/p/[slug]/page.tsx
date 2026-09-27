import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { title: "Portfolio Me" };
  }
  const supabase = await createClient();
  const { data: portfolio } = await supabase.from("portfolios").select("title, bio").eq("slug", slug).eq("status", "published").maybeSingle();
  return {
    title: portfolio?.title ? `${portfolio.title} — Portfolio Me` : "Portfolio Me",
    description: portfolio?.bio || "A portfolio made with Portfolio Me.",
  };
}

export default async function PublicPortfolioPage({ params }: Props) {
  const { slug } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <PublicMessage title="Portfolio Me is almost ready." body="Add Supabase environment variables to view published portfolios." />;
  }

  const supabase = await createClient();
  const { data: portfolio } = await supabase.from("portfolios").select("id, user_id, title, bio, theme").eq("slug", slug).eq("status", "published").maybeSingle();
  if (!portfolio) notFound();

  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase.from("profiles").select("display_name, role, email, linkedin_url, website_url").eq("id", portfolio.user_id).maybeSingle(),
    supabase.from("projects").select("id, title, description, project_url, language, stars, featured").eq("portfolio_id", portfolio.id).eq("visible", true).order("featured", { ascending: false }).order("stars", { ascending: false }),
  ]);

  return (
    <main className={`public-portfolio theme-${portfolio.theme || "intent"}`}>
      <nav className="public-nav"><a className="brand-link" href="/"><span className="brand"><span className="brand-mark">✦</span><span>portfolio<span className="brand-light">me</span></span></span></a><span className="public-label">PORTFOLIO / {String(projects?.length ?? 0).padStart(2, "0")} PROJECTS</span></nav>
      <header className="public-hero"><p className="eyebrow"><span className="eyebrow-dot" /> {profile?.role || "Creator"}</p><h1>{profile?.display_name || portfolio.title}<br /><em>makes useful things.</em></h1><p>{portfolio.bio || "A collection of work, ideas, and things worth sharing."}</p><a className="button button-primary" href="#work">Explore the work <span>↓</span></a></header><section className="public-about"><p className="eyebrow">A little more about me</p><p>{portfolio.bio || "I am interested in making thoughtful work, learning in public, and helping good ideas find their people."}</p></section>
      <section className="public-work" id="work"><div className="public-section-label"><span className="eyebrow">Selected work</span><span className="mono-label">APPROVED PROJECTS</span></div>{projects?.length ? <div className="public-projects">{projects.map((project, index) => <a className="public-project" href={project.project_url} target="_blank" rel="noreferrer" key={project.id}><span className="project-index">{String(index + 1).padStart(2, "0")}</span><div><h2>{project.title}{project.featured && <small className="featured-label">Featured</small>}</h2><p>{project.description || "A project worth a closer look."}</p></div><div className="public-project-meta"><span>{project.language || "Project"}</span>{project.stars > 0 && <span>★ {project.stars}</span>}<b>↗</b></div></a>)}</div> : <div className="public-empty"><span>✦</span><p>Projects are on their way.</p></div>}</section>
      {(profile?.email || profile?.linkedin_url || profile?.website_url) && <section className="public-contact"><p className="eyebrow">Let&apos;s connect</p><h2>Keep the<br /><em>conversation going.</em></h2><div className="public-contact-links">{profile.email && <a href={`mailto:${profile.email}`}>Email <span>↗</span></a>}{profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a>}{profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer">Website <span>↗</span></a>}</div></section>}
      <footer className="public-footer"><span>Built with Portfolio Me</span><a href="/">Make yours <span>↗</span></a></footer>
    </main>
  );
}

function PublicMessage({ title, body }: { title: string; body: string }) {
  return <main className="public-message"><span className="empty-star">✦</span><h1>{title}</h1><p>{body}</p><a className="button button-dark" href="/">Back home <span>↗</span></a></main>;
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "../../lib/supabase/client";
import { ProfileMenu } from "../components/profile-menu";

type Draft = { name: string; role: string; link?: string; slug?: string; status?: "draft" | "published" };

export default function DashboardPage() {
  const [draft, setDraft] = useState<Draft>({ name: "Alex Morgan", role: "Designer" });
  const [saveState, setSaveState] = useState<"loading" | "saved" | "local" | "error">("loading");
  const [saveMessage, setSaveMessage] = useState("");
  const [portfolio, setPortfolio] = useState<{ slug: string; status: "draft" | "published"; title: string; bio: string } | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function loadDraft() {
      const saved = localStorage.getItem("portfolio-me-draft");
      const localDraft = saved ? JSON.parse(saved) as Draft : null;

      if (!isSupabaseConfigured()) {
        if (localDraft) setDraft(localDraft);
        setSaveState("local");
        return;
      }

      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        setSaveState("error");
        setSaveMessage("Your session could not be loaded. Please sign in again.");
        return;
      }

      const userId = authData.user.id;
      const { data: portfolio, error: portfolioError } = await supabase
        .from("portfolios")
        .select("id, title, bio, slug, status")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (portfolioError) {
        setSaveState("error");
        setSaveMessage(portfolioError.message);
        return;
      }

      if (portfolio) {
        setPortfolio({ slug: portfolio.slug, status: portfolio.status, title: portfolio.title, bio: portfolio.bio });
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, role")
          .eq("id", userId)
          .maybeSingle();
        if (profile) setDraft({ name: profile.display_name, role: profile.role });
        const [{ count: sourceCount }] = await Promise.all([
          supabase.from("sources").select("id", { count: "exact", head: true }).eq("portfolio_id", portfolio.id),
        ]);
        const checks = [Boolean(profile?.display_name), Boolean(profile?.role), Boolean(portfolio.title), Boolean(portfolio.bio), Boolean(sourceCount), portfolio.status === "published"];
        setProgress(Math.round((checks.filter(Boolean).length / checks.length) * 100));
        setSaveState("saved");
        return;
      }

      if (!localDraft) {
        setSaveState("saved");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        display_name: localDraft.name,
        role: localDraft.role,
      });
      if (profileError) {
        setSaveState("error");
        setSaveMessage(profileError.message);
        return;
      }

      const { data: createdPortfolio, error: createPortfolioError } = await supabase
        .from("portfolios")
        .insert({
          user_id: userId,
          slug: `portfolio-${userId.slice(0, 8)}`,
          title: `${localDraft.name}'s portfolio`,
        })
        .select("id, slug, status, title, bio")
        .single();
      if (createPortfolioError || !createdPortfolio) {
        setSaveState("error");
        setSaveMessage(createPortfolioError?.message ?? "Portfolio could not be created.");
        return;
      }

      setPortfolio({
        slug: createdPortfolio.slug,
        status: createdPortfolio.status,
        title: createdPortfolio.title,
        bio: createdPortfolio.bio,
      });

      if (localDraft.link) {
        const { error: sourceError } = await supabase.from("sources").insert({
          portfolio_id: createdPortfolio.id,
          provider: "url",
          profile_url: localDraft.link,
        });
        if (sourceError) {
          setSaveState("error");
          setSaveMessage(sourceError.message);
          return;
        }
      }

      setDraft(localDraft);
      localStorage.removeItem("portfolio-me-draft");
      setSaveState("saved");
    }

    void loadDraft();
  }, []);

  const firstName = draft.name.split(" ")[0];
  return (
    <main className="dashboard-shell">
      <header className="product-header dashboard-header">
        <Link className="brand-link" href="/"><span className="brand"><span className="brand-mark">✦</span><span>portfolio<span className="brand-light">me</span></span></span></Link>
        <ProfileMenu name={draft.name} />
      </header>
      <p className={`save-indicator ${saveState === "error" ? "save-error" : ""}`} role={saveState === "error" ? "alert" : undefined}>
        {saveState === "loading" && "Loading your workspace…"}
        {saveState === "saved" && "Saved to your workspace"}
        {saveState === "local" && "Local preview mode — connect Supabase to save across devices"}
        {saveState === "error" && saveMessage}
      </p>
      <section className="dashboard-intro">
        <div><p className="eyebrow"><span className="eyebrow-dot" /> Your workspace</p><h1>Good morning,<br /><em>{firstName}.</em></h1><p>Let&apos;s turn what you&apos;ve made into something worth sharing.</p></div>
        <Link className="button button-primary" href="/dashboard/editor">Edit portfolio <span>↗</span></Link>
      </section>
      <section className="dashboard-grid">
        <div className="completion-card"><div className="card-top"><span className="mono-label">PORTFOLIO / {portfolio?.status === "published" ? "LIVE" : "DRAFT"}</span><span className="draft-status">● {portfolio?.status === "published" ? "PUBLISHED" : "DRAFT"}</span></div><div className="completion-progress"><div><strong>{progress}%</strong><span>complete</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div><h2>{portfolio?.status === "published" && progress >= 70 ? "It's taking shape." : "A good beginning."}</h2><p>{portfolio?.status === "published" ? "Your portfolio is live and ready to share with the world." : `${progress}% of your portfolio is ready. Keep shaping the details that make your work yours.`}</p>{portfolio?.status === "published" ? <a className="card-link" href={`/p/${portfolio.slug}`} target="_blank" rel="noreferrer">View live portfolio <span>↗</span></a> : <Link className="card-link" href="/dashboard/editor">Continue shaping <span>↗</span></Link>}</div>
        <div className="next-card"><span className="step-number">NEXT UP</span><div className="next-icon">◎</div><h3>Connect your world</h3><p>Bring in a profile link and we&apos;ll organize it for your portfolio.</p><Link className="button button-dark" href="/dashboard/editor">Add a source <span>↗</span></Link></div>
      </section>
    </main>
  );
}

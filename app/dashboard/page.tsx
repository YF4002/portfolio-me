"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Draft = { name: string; role: string; link?: string };

export default function DashboardPage() {
  const [draft, setDraft] = useState<Draft>({ name: "Alex Morgan", role: "Designer" });

  useEffect(() => {
    const saved = localStorage.getItem("portfolio-me-draft");
    if (saved) setDraft(JSON.parse(saved) as Draft);
  }, []);

  const firstName = draft.name.split(" ")[0];
  return (
    <main className="dashboard-shell">
      <header className="product-header dashboard-header">
        <Link className="brand-link" href="/"><span className="brand"><span className="brand-mark">✦</span><span>portfolio<span className="brand-light">me</span></span></span></Link>
        <div className="dashboard-user"><span className="user-avatar">{draft.name.slice(0, 2).toUpperCase()}</span><span>{draft.name}</span><span className="user-chevron">⌄</span></div>
      </header>
      <section className="dashboard-intro">
        <div><p className="eyebrow"><span className="eyebrow-dot" /> Your workspace</p><h1>Good morning,<br /><em>{firstName}.</em></h1><p>Let&apos;s turn what you&apos;ve made into something worth sharing.</p></div>
        <Link className="button button-primary" href="/dashboard/editor">Edit portfolio <span>↗</span></Link>
      </section>
      <section className="dashboard-grid">
        <div className="completion-card"><div className="card-top"><span className="mono-label">PORTFOLIO / DRAFT</span><span className="draft-status">● DRAFT</span></div><div className="completion-progress"><div><strong>20%</strong><span>complete</span></div><div className="progress-track"><span /></div></div><h2>A good beginning.</h2><p>Add a source to bring your first projects in, then make the story your own.</p><Link className="card-link" href="/dashboard/editor">Continue shaping <span>↗</span></Link></div>
        <div className="next-card"><span className="step-number">NEXT UP</span><div className="next-icon">◎</div><h3>Connect your world</h3><p>Bring in a profile or project link and we&apos;ll find the pieces worth featuring.</p><Link className="button button-dark" href="/dashboard/editor">Add a source <span>↗</span></Link></div>
      </section>
      <section className="dashboard-section"><div className="section-label"><span className="eyebrow">Your portfolio</span><span className="mono-label">LAST SAVED JUST NOW</span></div><div className="empty-projects"><span className="empty-star">✦</span><h2>Your best work<br /><em>starts here.</em></h2><p>Your portfolio is private while you build. Add a source to start filling it in.</p><Link className="text-link" href="/dashboard/editor">Open the editor <span>↗</span></Link></div></section>
    </main>
  );
}

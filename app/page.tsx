import { PortfolioBuilder } from "./portfolio-builder";

const sources = [
  ["in", "linkedin", "Experience & credentials"],
  ["⌘", "github", "Projects & code"],
  ["▶", "youtube", "Video & talks"],
  ["◎", "instagram", "Visual work"],
] as const;

function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark">✦</span>
      <span>
        portfolio<span className="brand-light">me</span>
      </span>
    </span>
  );
}

export default function Home() {
  return (
    <>
      <nav className="nav shell">
        <a className="brand-link" href="#" aria-label="Portfolio Me home">
          <Brand />
        </a>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#sources">Sources</a>
          <a href="#templates">Templates</a>
        </div>
        <a className="button button-small button-dark" href="/onboarding">
          Start building <span>↗</span>
        </a>
      </nav>

      <main>
        <section className="hero shell">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> Your work, in one place</p>
            <h1>The internet already knows your story.<em> Let&apos;s make it yours.</em></h1>
            <p className="hero-text">Portfolio Me gathers your best work from across the web and turns it into a portfolio that feels unmistakably you.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="/onboarding">Make my portfolio <span>↗</span></a>
              <a className="text-link" href="#how-it-works">See how it works <span>↓</span></a>
            </div>
            <div className="hero-note"><span className="avatar-stack"><i>JM</i><i>RK</i><i>AS</i></span><span>Join 2,400+ early creators</span></div>
          </div>
          <div className="hero-art" aria-label="Portfolio preview">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="profile-card">
              <div className="profile-top"><span className="mono-label">PORTFOLIO / 001</span><span className="status">● LIVE</span></div>
              <div className="profile-avatar">AM</div>
              <p className="profile-kicker">Product designer · New York</p>
              <h2>Alex Morgan<br /><span>makes useful things.</span></h2>
              <div className="profile-rule" />
              <div className="profile-footer"><span>alexmorgan.design</span><span>↗</span></div>
            </div>
            <span className="sticker sticker-top">made with intent</span>
            <span className="sticker sticker-bottom">✦ 2026</span>
          </div>
        </section>

        <section className="marquee-band" aria-label="Supported platforms">
          <div className="marquee shell"><span>LinkedIn</span><span>GitHub</span><span>YouTube</span><span>Instagram</span><span>Behance</span><span>Notion</span></div>
        </section>

        <section className="section shell" id="how-it-works">
          <div className="section-heading">
            <p className="eyebrow">01 — How it works</p>
            <h2>Less collecting.<br /><em>More creating.</em></h2>
            <p>Skip the blank page. We turn the scattered pieces of your professional life into a clear, compelling story.</p>
          </div>
          <div className="steps">
            <article className="step"><span className="step-number">01</span><div className="step-icon">◎</div><h3>Connect your world</h3><p>Bring in the platforms where your work already lives. You stay in control of what comes through.</p><a href="#sources">Explore sources <span>↗</span></a></article>
            <article className="step step-featured"><span className="step-number">02</span><div className="step-icon">✦</div><h3>Shape your story</h3><p>Our smart editor finds the signal, organizes your work, and helps you say what matters.</p><a href="/onboarding">Try the editor <span>↗</span></a></article>
            <article className="step"><span className="step-number">03</span><div className="step-icon">↗</div><h3>Share it proudly</h3><p>Pick a point of view, make it yours, and publish a portfolio you&apos;ll actually want to send.</p><a href="#templates">View templates <span>↗</span></a></article>
          </div>
        </section>

        <PortfolioBuilder />

        <section className="section shell sources-section" id="sources">
          <div className="section-heading compact"><p className="eyebrow">03 — Bring it all together</p><h2>Your work has<br /><em>more to say.</em></h2></div>
          <div className="source-list">{sources.map(([icon, className, label]) => <div key={className}><span className={`source-logo ${className}`}>{icon}</span><span>{label}</span><small>Connect</small></div>)}</div>
        </section>
      </main>

      <footer className="footer shell"><a className="brand-link" href="#"><Brand /></a><span>Make your work memorable.</span><span className="mono-label">© 2026 PORTFOLIO ME</span></footer>
    </>
  );
}

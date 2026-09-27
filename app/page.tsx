import { PortfolioBuilder } from "./portfolio-builder";

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
          <a href="#builder">Preview</a>
        </div>
        <div className="nav-actions"><a className="sign-in-link" href="/auth?mode=login">Sign in</a><a className="button button-small button-dark" href="/onboarding">Start building <span>↗</span></a></div>
      </nav>

      <main>
        <section className="hero shell">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> Your work, in one place</p>
            <h1>The internet already knows your story.<em> Let&apos;s make it yours.</em></h1>
            <p className="hero-text">Portfolio Me gathers your best work from across the web and turns it into a portfolio that feels unmistakably you.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="/onboarding">Make my portfolio <span>↗</span></a>
              <a className="text-link" href="#builder">See a preview <span>↓</span></a>
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

        <PortfolioBuilder />
      </main>

      <footer className="footer shell"><a className="brand-link" href="#"><Brand /></a><span>Make your work memorable.</span><span className="mono-label">© 2026 PORTFOLIO ME</span></footer>
    </>
  );
}

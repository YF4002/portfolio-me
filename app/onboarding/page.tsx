import Link from "next/link";
import { OnboardingForm } from "./onboarding-form";

export default function OnboardingPage() {
  return (
    <main className="product-shell">
      <header className="product-header">
        <Link className="brand-link" href="/">
          <span className="brand"><span className="brand-mark">✦</span><span>portfolio<span className="brand-light">me</span></span></span>
        </Link>
        <span className="product-progress">STEP 01 <span>OF 03</span></span>
      </header>
      <section className="onboarding-layout">
        <div className="onboarding-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Your first draft</p>
          <h1>Let&apos;s make<br /><em>your story.</em></h1>
          <p>Tell us a little about yourself. You can connect your work and fine-tune everything after this.</p>
          <div className="onboarding-note"><span>✦</span> Nothing is published without your approval.</div>
        </div>
        <OnboardingForm />
      </section>
    </main>
  );
}

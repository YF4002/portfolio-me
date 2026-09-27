import { AuthForm } from "./auth-form";

type AuthPageProps = {
  searchParams: Promise<{ mode?: string; next?: string }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const initialMode = params.mode === "login" ? "login" : "signup";

  return (
    <main className="product-shell">
      <header className="product-header">
        <a className="brand-link" href="/"><span className="brand"><span className="brand-mark">✦</span><span>portfolio<span className="brand-light">me</span></span></span></a>
        <span className="product-progress">SECURE ACCESS</span>
      </header>
      <section className="auth-layout">
        <div className="onboarding-copy"><p className="eyebrow"><span className="eyebrow-dot" /> Your workspace</p><h1>Keep your<br /><em>story safe.</em></h1><p>Create an account to save your draft, connect sources, and publish when you&apos;re ready.</p><div className="onboarding-note"><span>✦</span> Your portfolio stays private until you publish.</div></div>
        <AuthForm initialMode={initialMode} />
      </section>
    </main>
  );
}

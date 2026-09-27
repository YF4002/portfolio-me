"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "../../lib/supabase/client";

type AuthFormProps = {
  initialMode?: "signup" | "login";
};

export function AuthForm({ initialMode = "signup" }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [message, setMessage] = useState("");
  const configured = isSupabaseConfigured();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) {
      setMessage("Add your Supabase anon key to .env.local before continuing.");
      return;
    }
    const supabase = createClient();
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      setMessage("Check your email to confirm your account, then sign in.");
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
    router.push(next);
  }

  return <form className="onboarding-form auth-form" onSubmit={submit}><div className="form-intro"><span>{mode === "signup" ? "01" : "RETURNING"}</span><h2>{mode === "signup" ? "Create your account" : "Welcome back"}</h2><p>{mode === "signup" ? "Save your portfolio draft across devices." : "Sign in to continue shaping your portfolio."}</p></div><label>Email address<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" autoComplete="email" required /></label><label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="At least 6 characters" minLength={6} autoComplete={mode === "signup" ? "new-password" : "current-password"} required /></label>{message && <p className="form-error" role="alert">{message}</p>}<button className="button button-primary continue-button" type="submit">{mode === "signup" ? "Create account" : "Sign in"} <span>↗</span></button><button className="auth-switch" type="button" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setMessage(""); }}>{mode === "signup" ? "Already have an account? Sign in" : "Need an account? Create one"}</button></form>;
}

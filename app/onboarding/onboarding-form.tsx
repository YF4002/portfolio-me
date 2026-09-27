"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const roles = ["Designer", "Developer", "Creator", "Student", "Freelancer", "Other"];

export function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !role) {
      setError("Add your name and choose a role to continue.");
      return;
    }
    localStorage.setItem("portfolio-me-draft", JSON.stringify({ name: name.trim(), role, link: link.trim() }));
    router.push("/auth?next=/dashboard");
  }

  return (
    <form className="onboarding-form" onSubmit={submit}>
      <div className="form-intro"><span>01</span><h2>Start with the basics</h2><p>We&apos;ll use this to shape your first portfolio draft.</p></div>
      <label>Your name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" autoComplete="name" /></label>
      <fieldset><legend>What best describes you?</legend><div className="role-grid">{roles.map((item) => <button className={role === item ? "role selected" : "role"} type="button" key={item} onClick={() => setRole(item)}>{item}</button>)}</div></fieldset>
      <label>Where can we find your work? <span className="optional">Optional</span><input value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://github.com/you" type="url" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary continue-button" type="submit">Create my draft <span>↗</span></button>
      <p className="form-legal">By continuing, you agree to explore Portfolio Me. You can delete your draft anytime.</p>
    </form>
  );
}

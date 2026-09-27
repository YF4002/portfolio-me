"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "../../../lib/supabase/client";
import { ProfileMenu } from "../../components/profile-menu";
import { ProjectRow } from "./project-row";

type EditorState = {
  name: string;
  role: string;
  title: string;
  bio: string;
  email: string;
  linkedinUrl: string;
  websiteUrl: string;
};
type Repository = {
  externalId: string;
  title: string;
  description: string;
  projectUrl: string;
  language: string | null;
  stars: number;
  owner: string;
};
type Project = {
  id: string;
  title: string;
  description: string;
  language: string | null;
  stars: number;
  visible: boolean;
  featured: boolean;
};

const initialState: EditorState = {
  name: "",
  role: "",
  title: "",
  bio: "",
  email: "",
  linkedinUrl: "",
  websiteUrl: "",
};

export default function EditorPage() {
  const [form, setForm] = useState<EditorState>(initialState);
  const [sourceInput, setSourceInput] = useState("");
  const [portfolioId, setPortfolioId] = useState("");
  const [portfolioSlug, setPortfolioSlug] = useState("");
  const [published, setPublished] = useState(false);
  const [theme, setTheme] = useState("intent");
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Paste a profile or project URL to import your work.");
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepositories, setSelectedRepositories] = useState<string[]>([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubMessage, setGithubMessage] = useState("");

  useEffect(() => {
    async function loadEditor() {
      if (!isSupabaseConfigured()) {
        const saved = localStorage.getItem("portfolio-me-draft");
        if (saved) {
          const draft = JSON.parse(saved) as { name: string; role: string; link?: string; email?: string; linkedinUrl?: string; websiteUrl?: string };
          setForm({ name: draft.name, role: draft.role, title: `${draft.name}'s portfolio`, bio: "", email: draft.email ?? "", linkedinUrl: draft.linkedinUrl ?? "", websiteUrl: draft.websiteUrl ?? "" });
        }
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setError("Your session could not be loaded. Please sign in again.");
        setLoading(false);
        return;
      }

      const [{ data: profile }, { data: portfolio, error: portfolioError }] = await Promise.all([
        supabase.from("profiles").select("display_name, role, email, linkedin_url, website_url").eq("id", authData.user.id).maybeSingle(),
        supabase.from("portfolios").select("id, title, bio, slug, status, theme").eq("user_id", authData.user.id).order("created_at", { ascending: true }).limit(1).maybeSingle(),
      ]);

      if (portfolioError) {
        setError(portfolioError.message);
      } else {
        setPortfolioId(portfolio?.id ?? "");
        setPortfolioSlug(portfolio?.slug ?? "");
        setPublished(portfolio?.status === "published");
        setTheme(portfolio?.theme ?? "intent");
        setForm({
          name: profile?.display_name ?? "",
          role: profile?.role ?? "",
          title: portfolio?.title ?? "",
          bio: portfolio?.bio ?? "",
          email: profile?.email ?? "",
          linkedinUrl: profile?.linkedin_url ?? "",
          websiteUrl: profile?.website_url ?? "",
        });
        if (portfolio) {
          const { data: savedSource } = await supabase.from("sources").select("profile_url").eq("portfolio_id", portfolio.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
          const { data: savedProjects } = await supabase.from("projects").select("id, title, description, language, stars, visible, featured").eq("portfolio_id", portfolio.id).order("featured", { ascending: false }).order("stars", { ascending: false });
          setProjects(savedProjects ?? []);
        }
      }
      setLoading(false);
    }

    void loadEditor();
  }, []);

  function updateField(field: keyof EditorState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaveMessage("");
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage("");
    setError("");
    if (!form.name.trim() || !form.role.trim() || !form.title.trim() || !portfolioSlug.trim()) {
      setError("Name, role, portfolio title, and public URL are required.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(portfolioSlug)) {
      setError("Your public URL can only use lowercase letters, numbers, and hyphens.");
      return;
    }

    if (!isSupabaseConfigured()) {
      localStorage.setItem("portfolio-me-draft", JSON.stringify({ name: form.name.trim(), role: form.role.trim(), link: sourceInput.trim(), email: form.email.trim(), linkedinUrl: form.linkedinUrl.trim(), websiteUrl: form.websiteUrl.trim() }));
      setSaveMessage("Saved locally. Connect Supabase to sync across devices.");
      return;
    }

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setError("Your session expired. Please sign in again.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: authData.user.id,
      display_name: form.name.trim(),
      role: form.role.trim(),
      email: form.email.trim(),
      linkedin_url: form.linkedinUrl.trim(),
      website_url: form.websiteUrl.trim(),
    });
    if (profileError) {
      setError(profileError.message);
      return;
    }

    const { error: portfolioError } = await supabase.from("portfolios").update({
      title: form.title.trim(),
      bio: form.bio.trim(),
      slug: portfolioSlug,
      theme,
      updated_at: new Date().toISOString(),
    }).eq("id", portfolioId).eq("user_id", authData.user.id);
    if (portfolioError) {
      setError(portfolioError.message);
      return;
    }
    setSaveMessage("Your profile is saved.");
  }

  async function addSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!sourceInput.trim()) {
      setMessage("Add a URL before connecting a source.");
      return;
    }
    if (isSupabaseConfigured() && portfolioId) {
      const supabase = createClient();
      const { error: sourceError } = await supabase.from("sources").upsert({
        portfolio_id: portfolioId,
        provider: "url",
        profile_url: sourceInput.trim(),
        status: "pending",
      }, { onConflict: "portfolio_id,profile_url" });
      if (sourceError) {
        setMessage(sourceError.message);
        return;
      }
    } else {
      localStorage.setItem("portfolio-me-draft", JSON.stringify({ name: form.name, role: form.role, link: sourceInput.trim() }));
    }
    setSourceInput("");
    setMessage("Source saved. Import review will be available in the next phase.");
  }

  async function previewGitHub(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGithubLoading(true);
    setGithubMessage("");
    try {
      const response = await fetch("/api/github/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceInput }),
      });
      const data = await response.json() as { repositories?: Repository[]; error?: string };
      if (!response.ok) {
        setGithubMessage(data.error ?? "GitHub preview failed.");
        return;
      }
      setRepositories(data.repositories ?? []);
      setSelectedRepositories((data.repositories ?? []).map((repo) => repo.externalId));
      setGithubMessage(`${data.repositories?.length ?? 0} repositories found. Review and approve the ones you want to feature.`);
    } catch {
      setGithubMessage("GitHub preview failed. Check your connection and try again.");
    } finally {
      setGithubLoading(false);
    }
  }

  async function approveRepositories() {
    const approved = repositories.filter((repo) => selectedRepositories.includes(repo.externalId));
    if (!approved.length) {
      setGithubMessage("Select at least one repository to add.");
      return;
    }
    if (!isSupabaseConfigured() || !portfolioId) {
      setGithubMessage("Sign in with Supabase to save imported projects.");
      return;
    }
    const supabase = createClient();
    const { error: projectError } = await supabase.from("projects").upsert(
      approved.map((repo) => ({
        portfolio_id: portfolioId,
        external_id: `github:${repo.externalId}`,
        title: repo.title,
        description: repo.description,
        project_url: repo.projectUrl,
        language: repo.language,
        stars: repo.stars,
        visible: true,
        featured: false,
      })),
      { onConflict: "portfolio_id,external_id" },
    );
    if (projectError) {
      setGithubMessage(projectError.message);
      return;
    }
    setGithubMessage(`${approved.length} project${approved.length === 1 ? "" : "s"} added to your portfolio.`);
  }

  async function publishPortfolio() {
    if (!isSupabaseConfigured() || !portfolioId) {
      setError("Save your portfolio to Supabase before publishing.");
      return;
    }
    const supabase = createClient();
    const { error: publishError } = await supabase.from("portfolios").update({
      status: "published",
      updated_at: new Date().toISOString(),
    }).eq("id", portfolioId);
    if (publishError) {
      setError(publishError.message);
      return;
    }
    setSaveMessage("Published. Your portfolio is now live.");
    setPublished(true);
  }

  async function unpublishPortfolio() {
    if (!isSupabaseConfigured() || !portfolioId) return;
    const supabase = createClient();
    const { error: unpublishError } = await supabase.from("portfolios").update({
      status: "draft",
      updated_at: new Date().toISOString(),
    }).eq("id", portfolioId);
    if (unpublishError) {
      setError(unpublishError.message);
      return;
    }

    setPublished(false);
    setSaveMessage("Your portfolio is private again.");
  }

  async function toggleProject(project: Project) {
    if (!isSupabaseConfigured()) return;
    const nextVisible = !project.visible;
    const supabase = createClient();
    const { error: projectError } = await supabase.from("projects").update({ visible: nextVisible }).eq("id", project.id);
    if (projectError) {
      setError(projectError.message);
      return;
    }

    setProjects((current) => current.map((item) => item.id === project.id ? { ...item, visible: nextVisible } : item));
  }

  async function updateProject(project: Project, title: string, description: string) {
    if (!isSupabaseConfigured()) return;
    const { error: projectError } = await createClient().from("projects").update({ title, description }).eq("id", project.id);
    if (projectError) {
      setError(projectError.message);
      return;
    }

    setProjects((current) => current.map((item) => item.id === project.id ? { ...item, title, description } : item));
  }

  async function toggleFeatured(project: Project) {
    if (!isSupabaseConfigured()) return;
    const { error: projectError } = await createClient().from("projects").update({ featured: !project.featured }).eq("id", project.id);
    if (projectError) {
      setError(projectError.message);
      return;
    }
    setProjects((current) => current.map((item) => item.id === project.id ? { ...item, featured: !item.featured } : item));
  }

  return <main className="editor-shell"><header className="product-header"><Link className="brand-link" href="/dashboard"><span className="brand"><span className="brand-mark">✦</span><span>portfolio<span className="brand-light">me</span></span></span></Link><div className="editor-actions">{published && portfolioSlug && <><a className="live-link" href={`/p/${portfolioSlug}`} target="_blank" rel="noreferrer">View live <span>↗</span></a><button className="unpublish-button" type="button" onClick={() => void unpublishPortfolio()}>Unpublish</button></>}{!published && <button className="publish-button" type="button" onClick={() => void publishPortfolio()}>Publish portfolio <span>↗</span></button>}<Link className="editor-exit" href="/dashboard">Save &amp; exit</Link><ProfileMenu name={form.name || "You"} /></div></header><div className="editor-layout"><aside className="editor-sidebar"><p className="eyebrow">Portfolio editor</p><h1>Shape your<br /><em>story.</em></h1><nav><a className="active" href="#sources"><span>01</span> Sources</a><a href="#profile"><span>02</span> Profile</a><a href="#contact"><span>03</span> Contact</a><a href="#appearance"><span>04</span> Appearance</a></nav></aside><section className="editor-content">{loading ? <p className="editor-message">Loading your portfolio…</p> : <><div className="editor-heading"><p className="eyebrow" id="sources">01 — Sources</p><h2>Bring your work<br /><em>with you.</em></h2><p>Connect the places where your work already lives. We&apos;ll organize it for your review.</p></div>  <form className="source-form" onSubmit={addSource}><span className="source-form-icon">↗</span><input value={sourceInput} onChange={(event) => setSourceInput(event.target.value)} type="url" placeholder="Paste a profile or project URL" aria-label="Profile or project URL" /><button className="button button-dark" type="submit">Save URL <span>↗</span></button></form><p className="editor-message">{message}</p>    <div className="available-sources"><details><summary><span className="source-logo github">⌘</span><strong>GitHub</strong><span>Projects &amp; code</span><b>⌄</b></summary><form className="github-import source-import" onSubmit={previewGitHub}><p>Preview public repositories from a GitHub profile or repository.</p><div><input value={sourceInput} onChange={(event) => setSourceInput(event.target.value)} type="url" placeholder="https://github.com/you" aria-label="GitHub profile or repository URL" /><button className="button button-primary" type="submit" disabled={githubLoading}>{githubLoading ? "Finding…" : "Find projects"} <span>↗</span></button></div></form>{githubMessage && <p className="editor-message">{githubMessage}</p>}<div className="project-controls" id="projects"><input className="project-search" value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder="Search your repositories" aria-label="Search your repositories" />{projects.filter((project) => project.title.toLowerCase().includes(projectSearch.toLowerCase())).map((project) => <ProjectRow key={project.id} project={project} onToggle={() => void toggleProject(project)} onSave={(title, description) => updateProject(project, title, description)} onFeature={() => void toggleFeatured(project)} />)}{projects.length === 0 && <p className="editor-message">No GitHub repositories added yet.</p>}{projects.length > 0 && !projects.some((project) => project.title.toLowerCase().includes(projectSearch.toLowerCase())) && <p className="editor-message">No repositories match your search.</p>}</div></details><details><summary><span className="source-logo linkedin">in</span><strong>LinkedIn</strong><span>Experience &amp; credentials</span><b>⌄</b></summary><p>LinkedIn importing is coming soon. You can add your profile URL above for now.</p></details><details><summary><span className="source-logo youtube">▶</span><strong>YouTube</strong><span>Video &amp; talks</span><b>⌄</b></summary><p>YouTube importing is coming soon. You can add your channel URL above for now.</p></details></div><form className="profile-editor" id="profile" onSubmit={saveProfile}><p className="eyebrow">02 — Profile</p><h2>Make it<br /><em>sound like you.</em></h2><label>Your name<input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Alex Morgan" /></label><label>Your role<input value={form.role} onChange={(event) => updateField("role", event.target.value)}   placeholder="Product designer" /></label><label>Public URL <span className="optional">portfolio.me/p/</span><input value={portfolioSlug} onChange={(event) => { setPortfolioSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")); setSaveMessage(""); }} placeholder="your-name" /></label><label>Portfolio title<input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Alex Morgan's portfolio" /></label><label>About you <span className="optional">Your story</span><textarea value={form.bio} onChange={(event) => updateField("bio", event.target.value)} placeholder="Tell people what you care about, what you make, or anything you want them to know." rows={7} /></label><div className="profile-editor contact-editor" id="contact"><p className="eyebrow">03 — Contact</p><h3>Make it easy to<br /><em>reach you.</em></h3><p className="editor-message">Add only the links you want visitors to see.</p><label>Email address<input value={form.email} onChange={(event) => updateField("email", event.target.value)} type="email" placeholder="hello@example.com" /></label><label>LinkedIn URL<input value={form.linkedinUrl} onChange={(event) => updateField("linkedinUrl", event.target.value)} type="url" placeholder="https://linkedin.com/in/you" /></label><label>Personal website<input value={form.websiteUrl} onChange={(event) => updateField("websiteUrl", event.target.value)} type="url" placeholder="https://yourwebsite.com" /></label></div><fieldset className="theme-picker" id="appearance"><legend>04 — Appearance</legend><div><button type="button" className={theme === "intent" ? "theme-option selected" : "theme-option"} onClick={() => setTheme("intent")}>Intent <span>Dark + lime</span></button><button type="button" className={theme === "paper" ? "theme-option selected" : "theme-option"} onClick={() => setTheme("paper")}>Paper <span>Warm + quiet</span></button></div></fieldset>{error && <p className="form-error" role="alert">{error}</p>}{saveMessage && <p className="editor-success" role="status">{saveMessage}</p>}<div className="editor-save-actions"><button className="button button-primary" type="submit">Save profile <span>↗</span></button>{portfolioSlug && <a className="button button-dark" href={`/p/${portfolioSlug}`} target="_blank" rel="noreferrer">View page <span>↗</span></a>}</div></form></>}</section></div></main>;
}

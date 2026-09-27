"use client";

import { FormEvent, useState } from "react";

export function PortfolioBuilder() {
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("No account needed to explore.");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!link.trim()) {
      setMessage("Add a link to see your first draft.");
      setSubmitted(false);
      return;
    }
    setMessage("Nice. Your first draft is ready to shape.");
    setSubmitted(true);
  }

  return (
    <section className="builder-section" id="builder">
      <div className="shell builder-grid">
        <div className="builder-intro">
          <p className="eyebrow">02 — Your first draft</p>
          <h2>A little input.<br /><em>A lot of you.</em></h2>
          <p>Start with one link. We&apos;ll show you what your portfolio could look like before you commit to anything.</p>
          <form className="input-wrap" onSubmit={handleSubmit}>
            <span>↗</span>
            <input value={link} onChange={(event) => { setLink(event.target.value); setMessage("No account needed to explore."); setSubmitted(false); }} type="url" placeholder="Paste a profile or project link" aria-label="Profile or project link" />
            <button type="submit">{submitted ? "Added ✓" : "Preview"}</button>
          </form>
          <p className={`input-hint${submitted ? " success" : ""}`}>{message}</p>
        </div>
        <div className="builder-preview">
          <div className="preview-browser"><span className="browser-dots"><i /><i /><i /></span><span className="browser-url">portfolio.me / alex-morgan</span><span>•••</span></div>
          <div className="preview-content"><span className="preview-chip">PRODUCT DESIGNER <b>✦</b></span><h3>Designing for<br /><i>real life.</i></h3><p>I&apos;m Alex — a product designer making complex things feel simple, useful, and human.</p><div className="preview-projects"><span>SELECTED WORK</span><span>2022 — 2026</span></div><div className="project-line"><b>01</b><strong>Common Ground</strong><span>↗</span></div><div className="project-line"><b>02</b><strong>Reimagining care</strong><span>↗</span></div></div>
        </div>
      </div>
    </section>
  );
}

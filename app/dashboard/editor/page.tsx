"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function EditorPage() {
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("Paste a profile or project URL to import your work.");

  function addSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!source.trim()) {
      setMessage("Add a URL before connecting a source.");
      return;
    }
    setMessage("Source saved. Importing will be available in the next phase.");
  }

  return <main className="editor-shell"><header className="product-header"><Link className="brand-link" href="/dashboard"><span className="brand"><span className="brand-mark">✦</span><span>portfolio<span className="brand-light">me</span></span></span></Link><Link className="editor-exit" href="/dashboard">Save &amp; exit</Link></header><div className="editor-layout"><aside className="editor-sidebar"><p className="eyebrow">Portfolio editor</p><h1>Shape your<br /><em>story.</em></h1><nav><a className="active" href="#sources"><span>01</span> Sources</a><a href="#profile"><span>02</span> Profile</a><a href="#appearance"><span>03</span> Appearance</a></nav></aside><section className="editor-content"><div className="editor-heading"><p className="eyebrow" id="sources">01 — Sources</p><h2>Bring your work<br /><em>with you.</em></h2><p>Connect the places where your work already lives. We&apos;ll organize it for your review.</p></div><form className="source-form" onSubmit={addSource}><span className="source-form-icon">↗</span><input value={source} onChange={(event) => setSource(event.target.value)} type="url" placeholder="Paste a profile or project URL" aria-label="Profile or project URL" /><button className="button button-dark" type="submit">Connect <span>↗</span></button></form><p className="editor-message">{message}</p><div className="available-sources"><div><span className="source-logo github">⌘</span><strong>GitHub</strong><span>Projects &amp; code</span><button type="button" disabled>Coming soon</button></div><div><span className="source-logo linkedin">in</span><strong>LinkedIn</strong><span>Experience &amp; credentials</span><button type="button" disabled>Coming soon</button></div><div><span className="source-logo youtube">▶</span><strong>YouTube</strong><span>Video &amp; talks</span><button type="button" disabled>Coming soon</button></div></div></section></div></main>;
}

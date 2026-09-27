"use client";

import { useState } from "react";

type Project = {
  id: string;
  title: string;
  description: string;
  language: string | null;
  stars: number;
  visible: boolean;
  featured: boolean;
};

export function ProjectRow({
  project,
  onToggle,
  onSave,
  onFeature,
}: {
  project: Project;
  onToggle: () => void;
  onSave: (title: string, description: string) => Promise<void>;
  onFeature: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    await onSave(title.trim(), description.trim());
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return <div className="project-control project-edit-control"><input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Project title" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe this project" aria-label="Project description" rows={3} /><div><button type="button" onClick={() => void save()} disabled={saving}>{saving ? "Saving…" : "Save"}</button><button type="button" onClick={() => setEditing(false)}>Cancel</button></div></div>;
  }

  return <div className="project-control"><span><strong>{project.title}{project.featured && <mark>Featured</mark>}</strong><small>{project.language || "Repository"}{project.stars > 0 ? ` · ${project.stars} stars` : ""}</small>{project.description && <em>{project.description}</em>}</span><div className="project-control-actions"><button type="button" onClick={() => setEditing(true)}>Edit</button><button type="button" onClick={onFeature}>{project.featured ? "Unfeature" : "Feature"}</button><button type="button" onClick={onToggle}>{project.visible ? "Hide" : "Show"}</button></div></div>;
}

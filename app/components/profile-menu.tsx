"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "../../lib/supabase/client";

export function ProfileMenu({ name }: { name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    if (isSupabaseConfigured()) {
      const { error } = await createClient().auth.signOut();
      if (error) return;
    }
    router.push("/");
  }

  return <div className="profile-menu"><button className="dashboard-user" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}><span className="user-avatar">{name.slice(0, 2).toUpperCase()}</span><span className="profile-menu-name">{name}</span><span className="user-chevron">⌄</span></button>{open && <div className="profile-dropdown"><LinkPlaceholder label="Account settings" /><button type="button" onClick={() => void signOut()}>Sign out <span>↗</span></button></div>}</div>;
}

function LinkPlaceholder({ label }: { label: string }) {
  return <span className="profile-dropdown-muted">{label}</span>;
}

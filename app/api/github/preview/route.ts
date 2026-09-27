import { NextResponse } from "next/server";

type GitHubRepository = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  owner: { login: string };
};

function parseGitHubUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "github.com") return null;
    const segments = url.pathname.split("/").filter(Boolean);
    if (!segments[0]) return null;
    return { owner: segments[0], repo: segments[1]?.replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { url?: unknown } | null;
  const parsed = parseGitHubUrl(body?.url);
  if (!parsed) {
    return NextResponse.json({ error: "Enter a valid https://github.com profile or repository URL." }, { status: 400 });
  }

  const endpoint = parsed.repo
    ? `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`
    : `https://api.github.com/users/${encodeURIComponent(parsed.owner)}/repos?sort=updated&per_page=12`;
  const response = await fetch(endpoint, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "Portfolio-Me" },
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    if (response.status === 404) return NextResponse.json({ error: "That GitHub profile or repository could not be found." }, { status: 404 });
    return NextResponse.json({ error: "GitHub could not return that data right now. Try again shortly." }, { status: 502 });
  }

  const data = await response.json() as GitHubRepository | GitHubRepository[];
  const repositories = (Array.isArray(data) ? data : [data])
    .filter((repo) => !repo.fork)
    .map((repo) => ({
      externalId: String(repo.id),
      title: repo.name,
      description: repo.description ?? "",
      projectUrl: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      owner: repo.owner.login,
    }));

  return NextResponse.json({ repositories });
}

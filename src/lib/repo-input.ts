const OWNER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const REPO_RE = /^[A-Za-z0-9._-]{1,100}$/;

export function parseRepoReference(raw: string): { owner: string; repo: string } {
  const value = raw.trim();
  if (!value) {
    throw new Error("Informe um repositório no formato usuario/repositorio.");
  }

  let candidate = value;

  if (/^https?:\/\//i.test(candidate)) {
    const url = new URL(candidate);
    if (url.hostname.toLowerCase() !== "github.com") {
      throw new Error("Use uma URL do github.com.");
    }
    candidate = url.pathname.replace(/^\/+|\/+$/g, "");
  }

  candidate = candidate
    .replace(/^github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/^\/+|\/+$/g, "");

  const parts = candidate.split("/").filter(Boolean);
  if (parts.length !== 2) {
    throw new Error("Use o formato usuario/repositorio ou uma URL do GitHub.");
  }

  const [owner, repo] = parts;
  if (!OWNER_RE.test(owner) || !REPO_RE.test(repo)) {
    throw new Error("O nome do repositório contém caracteres inválidos.");
  }

  return { owner, repo };
}

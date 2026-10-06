export interface GitHubRepository {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  archived: boolean;
  pushed_at: string;
  visibility?: string;
  private: boolean;
  topics?: string[];
  license?: { spdx_id?: string | null; name?: string | null } | null;
  owner: { login: string };
}

interface GitTreeResponse {
  truncated: boolean;
  tree: Array<{
    path: string;
    type: "blob" | "tree" | "commit";
  }>;
}

export interface GitHubSnapshot {
  repository: GitHubRepository;
  languages: Record<string, number>;
  paths: string[];
  treeTruncated: boolean;
}

class GitHubRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

function headers(token?: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "User-Agent": "RepoLens",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubJson<T>(
  path: string,
  token?: string,
  cacheTag?: string,
): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: headers(token),
    next: {
      revalidate: 300,
      ...(cacheTag ? { tags: [cacheTag] } : {}),
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    let message = `GitHub respondeu com status ${response.status}.`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // If GitHub sends no usable body, the status-based message is clearer than
      // leaking a JSON parsing error to the user.
    }
    throw new GitHubRequestError(message, response.status);
  }

  return (await response.json()) as T;
}

export async function fetchRepositorySnapshot(
  owner: string,
  repo: string,
  token?: string,
): Promise<GitHubSnapshot> {
  const encodedOwner = encodeURIComponent(owner);
  const encodedRepo = encodeURIComponent(repo);

  const cacheTag = `repo:${owner}/${repo}`;

  const repository = await githubJson<GitHubRepository>(
    `/repos/${encodedOwner}/${encodedRepo}`,
    token,
    cacheTag,
  );

  const encodedBranch = encodeURIComponent(repository.default_branch);

  const [languages, tree] = await Promise.all([
    githubJson<Record<string, number>>(
      `/repos/${encodedOwner}/${encodedRepo}/languages`,
      token,
      cacheTag,
    ),
    githubJson<GitTreeResponse>(
      `/repos/${encodedOwner}/${encodedRepo}/git/trees/${encodedBranch}?recursive=1`,
      token,
      cacheTag,
    ),
  ]);

  return {
    repository,
    languages,
    paths: tree.tree.map((item) => item.path),
    treeTruncated: tree.truncated,
  };
}

export function toPublicGitHubError(error: unknown) {
  if (error instanceof GitHubRequestError) {
    if (error.status === 404) {
      return { status: 404, message: "Repositório não encontrado ou sem acesso." };
    }
    if (error.status === 403 || error.status === 429) {
      return {
        status: 429,
        message:
          "Limite da API do GitHub atingido. Configure GITHUB_TOKEN no servidor para ampliar a cota.",
      };
    }
  }

  if (error instanceof Error && error.name === "TimeoutError") {
    return { status: 504, message: "O GitHub demorou demais para responder." };
  }

  return {
    status: 502,
    message: "Não foi possível consultar o GitHub agora.",
  };
}

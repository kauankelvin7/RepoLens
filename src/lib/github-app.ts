import { createSign } from "node:crypto";

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function appHeaders() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${createGitHubAppJwt()}`,
    "User-Agent": "RepoLens",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function appJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ response: Response; data: T | null }> {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      ...appHeaders(),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  let data: T | null = null;
  try {
    data = (await response.json()) as T;
  } catch {
    // Some GitHub responses may not include a JSON body.
  }

  return { response, data };
}

export function isGitHubAppAuthConfigured() {
  return Boolean(process.env.GITHUB_APP_ID && process.env.GITHUB_PRIVATE_KEY);
}

export function isGitHubAppConfigured() {
  return Boolean(
    isGitHubAppAuthConfigured() && process.env.GITHUB_WEBHOOK_SECRET,
  );
}

export function createGitHubAppJwt() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!appId || !privateKey) {
    throw new Error("GitHub App não configurado.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iat: now - 60,
      exp: now + 9 * 60,
      iss: appId,
    }),
  );

  const unsigned = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256")
    .update(unsigned)
    .sign(privateKey)
    .toString("base64url");

  return `${unsigned}.${signature}`;
}

export async function validateGitHubAppAuthentication() {
  const { response, data } = await appJson<{
    id?: number;
    slug?: string;
    name?: string;
  }>("/app");

  if (!response.ok || !data?.id) {
    throw new Error(`Falha ao autenticar GitHub App (${response.status}).`);
  }

  return {
    id: data.id,
    slug: data.slug ?? null,
    name: data.name ?? null,
  };
}

export async function getRepositoryInstallation(
  owner: string,
  repo: string,
): Promise<{ id: number } | null> {
  const encodedOwner = encodeURIComponent(owner);
  const encodedRepo = encodeURIComponent(repo);

  const { response, data } = await appJson<{ id?: number }>(
    `/repos/${encodedOwner}/${encodedRepo}/installation`,
  );

  if (response.status === 404) return null;

  if (!response.ok || !data?.id) {
    throw new Error(
      `Falha ao localizar instalação do GitHub App (${response.status}).`,
    );
  }

  return { id: data.id };
}

export async function getInstallationToken(installationId: number) {
  if (!Number.isInteger(installationId) || installationId <= 0) {
    throw new Error("Installation ID inválido.");
  }

  const { response, data } = await appJson<{ token?: string }>(
    `/app/installations/${installationId}/access_tokens`,
    { method: "POST" },
  );

  if (!response.ok || !data?.token) {
    throw new Error(
      `Falha ao criar installation token (${response.status}).`,
    );
  }

  return data.token;
}

export async function getRepositoryInstallationToken(
  owner: string,
  repo: string,
) {
  const installation = await getRepositoryInstallation(owner, repo);
  if (!installation) return null;

  return getInstallationToken(installation.id);
}
